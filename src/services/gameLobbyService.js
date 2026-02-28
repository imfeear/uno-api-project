const { Game } = require("../models");
const playerGameRepo = require("../repositories/playerGameRepository");

function parsePositiveInt(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
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
    maxPlayers: maxPlayers || 4
  });

  await playerGameRepo.create({ gameId: game.id, userId: creatorId, isReady: false });

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

  await game.update({ status: "in_progress" });
  return { data: { message: "Game started successfully" }, status: 200 };
}

// 13. deixar o jogo em andamento
async function leaveGame(gameId, userId) {
  if (!userId) return { error: "Invalid token", status: 401 };

  const id = parsePositiveInt(gameId);
  if (!id) return { error: "game_id is required", status: 400 };

  const game = await Game.findByPk(id);
  if (!game) return { error: "Game not found", status: 404 };

  if (game.status !== "in_progress") {
    return { error: "Game is not in progress", status: 409 };
  }

  const entry = await playerGameRepo.findByGameAndUser(id, userId);
  if (!entry) return { error: "User is not part of this game", status: 404 };

  await playerGameRepo.removeByGameAndUser(id, userId);
  return { data: { message: "User left the game successfully" }, status: 200 };
}

// 14. finalizar jogo
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
  return { data: { message: "Game ended successfully" }, status: 200 };
}

// 15. obter estado atual do jogo
async function getCurrentState(gameId, userId) {
  if (!userId) return { error: "Invalid token", status: 401 };

  const id = parsePositiveInt(gameId);
  if (!id) return { error: "game_id is required", status: 400 };

  const game = await Game.findByPk(id);
  if (!game) return { error: "Game not found", status: 404 };

  if (game.status !== "in_progress") {
    return { error: "Game is not in progress", status: 409 };
  }

  const players = await playerGameRepo.findByGame(id);

  return {
    data: {
      game_id: id,
      status: game.status,
      maxPlayers: game.maxPlayers,
      playersCount: players.length
    },
    status: 200
  };
}

module.exports = {
  createGame,
  joinGame,
  setReady,
  startGame,
  leaveGame,
  endGame,
  getCurrentState
};
