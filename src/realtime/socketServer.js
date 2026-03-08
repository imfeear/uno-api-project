const { Server } = require("socket.io");
const authService = require("../services/authService");
const userRepo = require("../repositories/userRepository");
const playerGameRepo = require("../repositories/playerGameRepository");
const lobbyService = require("../services/gameLobbyService");
const realtimeGameService = require("../services/realtimeGameService");
const lobbyEvents = require("./gameLobbyEvents");

let ioInstance = null;

async function socketAuth(socket, next) {
  try {
    const bearer = socket.handshake.auth && socket.handshake.auth.token;
    const header = socket.handshake.headers && socket.handshake.headers.authorization;

    let token = bearer;

    if (!token && typeof header === "string") {
      const parts = header.split(" ");
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        token = parts[1];
      }
    }

    const result = authService.verifyToken(token);
    if (result.error) {
      return next(new Error("Invalid token"));
    }

    const user = await userRepo.findById(result.payload.userId);
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      token,
    };

    return next();
  } catch (error) {
    return next(new Error("Socket authentication failed"));
  }
}

async function emitLobbySnapshot(gameId) {
  if (!ioInstance) return;

  const snapshot = await lobbyService.buildLobbySnapshot(gameId);
  if (!snapshot) return;

  ioInstance.to(`game:${gameId}`).emit("lobby_snapshot", snapshot);
}

async function emitRealtimeStateToRoom(gameId) {
  if (!ioInstance) return;

  const snapshot = await realtimeGameService.buildRealtimeSnapshot(gameId);
  if (!snapshot) return;

  ioInstance.to(`game:${gameId}`).emit("game_state", snapshot);
}

async function emitPrivateStateToPlayers(gameId) {
  if (!ioInstance) return;

  const players = await playerGameRepo.findByGame(gameId);

  for (const player of players) {
    const personalView = await realtimeGameService.buildPlayerView(gameId, player.userId);
    ioInstance.to(`user:${player.userId}`).emit("private_game_state", personalView);
  }
}

function registerLobbyEventBridge(io) {
  lobbyEvents.on("game_created", async ({ gameId }) => {
    const snapshot = await lobbyService.buildLobbySnapshot(gameId);
    if (!snapshot) return;

    io.emit("game_created", snapshot);
    io.to(`game:${gameId}`).emit("lobby_snapshot", snapshot);
  });

  const relayGameEvent = async ({ type, gameId, actor, message }) => {
    const snapshot = await lobbyService.buildLobbySnapshot(gameId);

    io.to(`game:${gameId}`).emit("game_event", {
      type,
      gameId,
      actor,
      message,
      snapshot,
      createdAt: new Date().toISOString(),
    });

    if (snapshot) {
      io.to(`game:${gameId}`).emit("lobby_snapshot", snapshot);
    }
  };

  lobbyEvents.on("player_joined", relayGameEvent);
  lobbyEvents.on("player_ready", relayGameEvent);
  lobbyEvents.on("game_started", relayGameEvent);
  lobbyEvents.on("player_left", relayGameEvent);
  lobbyEvents.on("game_ended", relayGameEvent);

  lobbyEvents.on("realtime_game_updated", async ({ type, gameId, actor, message }) => {
    const snapshot = await realtimeGameService.buildRealtimeSnapshot(gameId);

    io.to(`game:${gameId}`).emit("game_event", {
      type,
      gameId,
      actor,
      message,
      snapshot,
      createdAt: new Date().toISOString(),
    });

    if (snapshot) {
      io.to(`game:${gameId}`).emit("game_state", snapshot);
    }

    await emitPrivateStateToPlayers(gameId);
  });
}

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.emit("connected", {
      user: {
        id: socket.user.id,
        username: socket.user.username,
        email: socket.user.email,
      },
    });

    socket.on("join_game_room", async ({ game_id }) => {
      try {
        const entry = await playerGameRepo.findByGameAndUser(game_id, socket.user.id);
        if (!entry) {
          socket.emit("room_error", { message: "Você não faz parte desta partida." });
          return;
        }

        socket.join(`game:${game_id}`);
        socket.emit("room_joined", { game_id });

        await emitLobbySnapshot(game_id);
        await emitRealtimeStateToRoom(game_id);

        const personalView = await realtimeGameService.buildPlayerView(game_id, socket.user.id);
        socket.emit("private_game_state", personalView);
      } catch (error) {
        socket.emit("room_error", { message: "Falha ao entrar na sala." });
      }
    });

    socket.on("leave_game_room", async ({ game_id }) => {
      try {
        socket.leave(`game:${game_id}`);
        socket.emit("room_left", { game_id });
      } catch (error) {
        socket.emit("room_error", { message: "Falha ao sair da sala." });
      }
    });

    socket.on("chat_message", async ({ game_id, message }) => {
      try {
        if (!message || typeof message !== "string" || !message.trim()) {
          socket.emit("room_error", { message: "Mensagem inválida." });
          return;
        }

        const entry = await playerGameRepo.findByGameAndUser(game_id, socket.user.id);
        if (!entry) {
          socket.emit("room_error", { message: "Você não faz parte desta partida." });
          return;
        }

        io.to(`game:${game_id}`).emit("chat_message", {
          gameId: game_id,
          user: {
            id: socket.user.id,
            username: socket.user.username,
          },
          message: message.trim(),
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        socket.emit("room_error", { message: "Falha ao enviar mensagem." });
      }
    });

    socket.on("request_game_state", async ({ game_id }) => {
      try {
        const entry = await playerGameRepo.findByGameAndUser(game_id, socket.user.id);
        if (!entry) {
          socket.emit("room_error", { message: "Você não faz parte desta partida." });
          return;
        }

        const roomState = await realtimeGameService.buildRealtimeSnapshot(game_id);
        const personalView = await realtimeGameService.buildPlayerView(game_id, socket.user.id);

        socket.emit("game_state", roomState);
        socket.emit("private_game_state", personalView);
      } catch (error) {
        socket.emit("room_error", { message: "Falha ao carregar estado da partida." });
      }
    });

    socket.on("disconnect", () => {});
  });

  registerLobbyEventBridge(io);
  ioInstance = io;
  return io;
}

module.exports = {
  initSocketServer,
};