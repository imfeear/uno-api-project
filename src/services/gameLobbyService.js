const { Game } = require("../models");
const playerGameRepo = require("../repositories/playerGameRepository");
const lobbyEvents = require("../realtime/gameLobbyEvents");
const realtimeGameService = require("./realtimeGameService");

function parsePositiveInt(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

async function buildLobbySnapshot(gameId) {
  const game = await Game.findByPk(gameId);
  if (!game) return null;

  const players = await playerGameRepo.findByGame(gameId);

  return {
    game_id: game.id,
    title: game.title,
    rules: game.rules,
    status: game.status,
    maxPlayers: game.maxPlayers,
    creatorId: game.creatorId,
    players: players.map((entry) => ({
      id: entry.userId,
      username: entry.user ? entry.user.username : null,
      email: entry.user ? entry.user.email : null,
      isReady: entry.isReady,
      joinedAt: entry.joinedAt,
    })),
  };
}

async function createGame({ name, rules, max_players }, creatorId) {
  if (!creatorId) return { error: "Invalid token", status: 401 };
  if (!name || typeof name !== "string") return { error: "name is required", status: 400 };

  const maxPlayers = max_players !== undefined ? parsePositiveInt(max_players) : null;
  if (max_players !== undefined && !maxPlayers) {
    return { error: "max_players must be an integer > 0", status: 400 };
  }

  const game = await Game.create({
    title: name,
    rules: rules || null,
    creatorId,
    status: "waiting",
    maxPlayers: maxPlayers || 4,
  });

  await playerGameRepo.create({ gameId: game.id, userId: creatorId, isReady: false });
  lobbyEvents.emit("game_created", { gameId: game.id, actor: creatorId });

  return { data: { message: "Game created successfully", game_id: game.id }, status: 201 };
}

async function joinGame(gameId, userId) {
  if (!userId) return { error: "Invalid token", status: 401 };

  const id = parsePositiveInt(gameId);
  if (!id) return { error: "game_id is required", status: 400 };

  const game = await Game.findByPk(id);
  if (!game) return { error: "Game not found", status: 404 };
  if (game.status === "finished") return { error: "Game already ended", status: 409 };

  const existing = await playerGameRepo.findByGameAndUser(id, userId);
  if (existing) return { error: "User already joined this game", status: 409 };

  const players = await playerGameRepo.findByGame(id);
  if (players.length >= game.maxPlayers) {
    return { error: "Game is full", status: 409 };
  }

  await playerGameRepo.create({ gameId: id, userId, isReady: false });
  lobbyEvents.emit("player_joined", {
    gameId: id,
    actor: userId,
    type: "player_joined",
    message: "A new player joined the lobby.",
  });

  return { data: { message: "User joined the game successfully" }, status: 200 };
}

async function setReady(gameId, userId) {
  if (!userId) return { error: "Invalid token", status: 401 };

  const id = parsePositiveInt(gameId);
  if (!id) return { error: "game_id is required", status: 400 };

  const entry = await playerGameRepo.findByGameAndUser(id, userId);
  if (!entry) return { error: "User is not part of this game", status: 404 };
  if (entry.isReady) return { data: { message: "User is already marked as ready" }, status: 200 };

  await playerGameRepo.updateReady(entry.id, true);
  lobbyEvents.emit("player_ready", {
    gameId: id,
    actor: userId,
    type: "player_ready",
    message: "A player is ready.",
  });

  return { data: { message: "User marked as ready" }, status: 200 };
}

async function startGame(gameId, userId) {
  if (!userId) return { error: "Invalid token", status: 401 };

  const id = parsePositiveInt(gameId);
  if (!id) return { error: "game_id is required", status: 400 };

  const game = await Game.findByPk(id);
  if (!game) return { error: "Game not found", status: 404 };
  if (game.creatorId !== userId) {
    return { error: "Only the game creator can start the game", status: 403 };
  }
  if (game.status === "in_progress") return { error: "Game already started", status: 409 };
  if (game.status === "finished") return { error: "Game already ended", status: 409 };

  const players = await playerGameRepo.findByGame(id);
  if (players.length < 2) {
    return { error: "Not enough players", status: 409 };
  }

  const allReady = players.every((p) => p.isReady === true);
  if (!allReady) return { error: "Not all users are ready", status: 409 };

  await game.update({
  status: "in_progress",
  startedAt: new Date()
});

  await realtimeGameService.startRealtimeGame(id);
  lobbyEvents.emit("game_started", {
    gameId: id,
    actor: userId,
    type: "game_started",
    message: "The game has started.",
  });

  return { data: { message: "Game started successfully" }, status: 200 };
}

async function leaveGame(gameId, userId) {
  if (!userId) return { error: "Invalid token", status: 401 };

  const id = parsePositiveInt(gameId);
  if (!id) return { error: "game_id is required", status: 400 };

  const game = await Game.findByPk(id);
  if (!game) return { error: "Game not found", status: 404 };
  if (game.status !== "in_progress" && game.status !== "waiting") {
    return { error: "Game is not active", status: 409 };
  }

  const entry = await playerGameRepo.findByGameAndUser(id, userId);
  if (!entry) return { error: "User is not part of this game", status: 404 };

  const playersBefore = await playerGameRepo.findByGame(id);
  const leavingIndex = playersBefore.findIndex((p) => p.userId === userId);

  await playerGameRepo.removeByGameAndUser(id, userId);

  const playerHandRepo = require("../repositories/playerHandRepository");
  const gameStateRepo = require("../repositories/gameStateRepository");

  await playerHandRepo.removeByGameAndUser(id, userId);

  const state = await gameStateRepo.findByGameId(id);
  const playersAfter = await playerGameRepo.findByGame(id);

  if (state && playersAfter.length > 0) {
    let newCurrentIndex = state.currentPlayerIndex;

    if (leavingIndex >= 0) {
      if (leavingIndex < state.currentPlayerIndex) {
        newCurrentIndex = state.currentPlayerIndex - 1;
      } else if (leavingIndex === state.currentPlayerIndex) {
        newCurrentIndex = state.currentPlayerIndex;
        if (newCurrentIndex >= playersAfter.length) {
          newCurrentIndex = 0;
        }
      }
    }

    await state.update({
      currentPlayerIndex: Math.max(0, newCurrentIndex)
    });
  }

  if (game.status === "in_progress" && playersAfter.length <= 1) {
    await game.update({ status: "finished" });
  }

  lobbyEvents.emit("player_left", {
    gameId: id,
    actor: userId,
    type: "player_left",
    message: "A player left the game.",
  });

  return { data: { message: "User left the game successfully" }, status: 200 };
}

async function endGame(gameId, userId) {
  if (!userId) return { error: "Invalid token", status: 401 };

  const id = parsePositiveInt(gameId);
  if (!id) return { error: "game_id is required", status: 400 };

  const game = await Game.findByPk(id);
  if (!game) return { error: "Game not found", status: 404 };
  if (game.creatorId !== userId) {
    return { error: "Only the game creator can end the game", status: 403 };
  }
  if (game.status === "finished") return { error: "Game already ended", status: 409 };

  await game.update({ status: "finished" });
  lobbyEvents.emit("game_ended", {
    gameId: id,
    actor: userId,
    type: "game_ended",
    message: "The game has ended.",
  });

  return { data: { message: "Game ended successfully" }, status: 200 };
}

async function getCurrentState(gameId, userId) {
  if (!userId) return { error: "Invalid token", status: 401 };

  const id = parsePositiveInt(gameId);
  if (!id) return { error: "game_id is required", status: 400 };

  const game = await Game.findByPk(id);
  if (!game) return { error: "Game not found", status: 404 };

  const entry = await playerGameRepo.findByGameAndUser(id, userId);
  if (!entry) return { error: "User is not part of this game", status: 404 };

  const snapshot = await buildLobbySnapshot(id);
  return { data: snapshot, status: 200 };
}

module.exports = {
  createGame,
  joinGame,
  setReady,
  startGame,
  leaveGame,
  endGame,
  getCurrentState,
  buildLobbySnapshot,
};