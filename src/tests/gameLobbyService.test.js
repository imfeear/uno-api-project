const gameLobbyService = require("../../src/services/gameLobbyService");
const { Game } = require("../../src/models");
const playerGameRepo = require("../../src/repositories/playerGameRepository");

jest.mock("../../src/models");
jest.mock("../../src/repositories/playerGameRepository");

describe("Game Lobby Service Unit Tests (10-15)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 10. Criar jogo
  describe("createGame", () => {
    it("deve criar um jogo com sucesso e adicionar o criador", async () => {
      const mockGame = { id: 10 };
      Game.create.mockResolvedValue(mockGame);
      playerGameRepo.create.mockResolvedValue({});

      const result = await gameLobbyService.createGame(
        { name: "Novo Jogo", max_players: 4 },
        1
      );

      expect(result.status).toBe(201);
      expect(result.data.game_id).toBe(10);
      expect(result.data.message).toBe("Game created successfully");

      expect(Game.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Novo Jogo",
          creatorId: 1,
          status: "waiting",
          maxPlayers: 4
        })
      );

      expect(playerGameRepo.create).toHaveBeenCalledWith({
        gameId: 10,
        userId: 1,
        isReady: false
      });
    });

    it("deve retornar erro se name não for fornecido", async () => {
      const result = await gameLobbyService.createGame({}, 1);
      expect(result.status).toBe(400);
      expect(result.error).toBe("name is required");
    });

    it("deve retornar erro se token/usuário for inválido", async () => {
      const result = await gameLobbyService.createGame({ name: "Jogo" }, null);
      expect(result.status).toBe(401);
      expect(result.error).toBe("Invalid token");
    });

    it("deve retornar erro se max_players for inválido", async () => {
      const result = await gameLobbyService.createGame({ name: "Jogo", max_players: 0 }, 1);
      expect(result.status).toBe(400);
      expect(result.error).toBe("max_players must be an integer > 0");
    });
  });

  // 11. Entrar em jogo existente
  describe("joinGame", () => {
    it("deve permitir entrar em jogo existente com sucesso", async () => {
      Game.findByPk.mockResolvedValue({ id: 7, status: "waiting", maxPlayers: 4 });
      playerGameRepo.findByGameAndUser.mockResolvedValue(null);
      playerGameRepo.findByGame.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      playerGameRepo.create.mockResolvedValue({});

      const result = await gameLobbyService.joinGame(7, 99);

      expect(result.status).toBe(200);
      expect(result.data.message).toBe("User joined the game successfully");

      expect(playerGameRepo.create).toHaveBeenCalledWith({
        gameId: 7,
        userId: 99,
        isReady: false
      });
    });

    it("deve retornar erro se jogo não existir", async () => {
      Game.findByPk.mockResolvedValue(null);

      const result = await gameLobbyService.joinGame(7, 99);

      expect(result.status).toBe(404);
      expect(result.error).toBe("Game not found");
    });

    it("deve retornar erro se jogo estiver cheio", async () => {
      Game.findByPk.mockResolvedValue({ id: 7, status: "waiting", maxPlayers: 2 });
      playerGameRepo.findByGameAndUser.mockResolvedValue(null);
      playerGameRepo.findByGame.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const result = await gameLobbyService.joinGame(7, 99);

      expect(result.status).toBe(409);
      expect(result.error).toBe("Game is full");
    });

    it("deve retornar erro se usuário já tiver entrado", async () => {
      Game.findByPk.mockResolvedValue({ id: 7, status: "waiting", maxPlayers: 4 });
      playerGameRepo.findByGameAndUser.mockResolvedValue({ id: 123 });

      const result = await gameLobbyService.joinGame(7, 99);

      expect(result.status).toBe(409);
      expect(result.error).toBe("User already joined this game");
    });

    it("deve retornar erro se jogo já terminou", async () => {
      Game.findByPk.mockResolvedValue({ id: 7, status: "finished", maxPlayers: 4 });

      const result = await gameLobbyService.joinGame(7, 99);

      expect(result.status).toBe(409);
      expect(result.error).toBe("Game already ended");
    });

    it("deve retornar erro se game_id for inválido", async () => {
      const result = await gameLobbyService.joinGame(undefined, 99);
      expect(result.status).toBe(400);
      expect(result.error).toBe("game_id is required");
    });

    it("deve retornar erro se token/usuário for inválido", async () => {
      const result = await gameLobbyService.joinGame(7, null);
      expect(result.status).toBe(401);
      expect(result.error).toBe("Invalid token");
    });
  });

  // 12. Iniciar jogo quando todos estiverem prontos
  describe("startGame", () => {
    it("deve iniciar o jogo com sucesso quando todos estiverem prontos", async () => {
      const game = { id: 7, creatorId: 1, status: "waiting", update: jest.fn() };
      Game.findByPk.mockResolvedValue(game);

      playerGameRepo.findByGame.mockResolvedValue([
        { id: 1, isReady: true },
        { id: 2, isReady: true }
      ]);

      const result = await gameLobbyService.startGame(7, 1);

      expect(result.status).toBe(200);
      expect(result.data.message).toBe("Game started successfully");
      expect(game.update).toHaveBeenCalledWith({ status: "in_progress" });
    });

    it("deve retornar erro quando não houver jogadores suficientes", async () => {
      const game = { id: 7, creatorId: 1, status: "waiting", update: jest.fn() };
      Game.findByPk.mockResolvedValue(game);

      playerGameRepo.findByGame.mockResolvedValue([{ id: 1, isReady: true }]);

      const result = await gameLobbyService.startGame(7, 1);

      expect(result.status).toBe(409);
      expect(result.error).toBe("Not enough players");
    });

    it("deve retornar erro quando nem todos estiverem prontos", async () => {
      const game = { id: 7, creatorId: 1, status: "waiting", update: jest.fn() };
      Game.findByPk.mockResolvedValue(game);

      playerGameRepo.findByGame.mockResolvedValue([
        { id: 1, isReady: true },
        { id: 2, isReady: false }
      ]);

      const result = await gameLobbyService.startGame(7, 1);

      expect(result.status).toBe(409);
      expect(result.error).toBe("Not all users are ready");
      expect(game.update).not.toHaveBeenCalled();
    });

    it("deve retornar erro se jogo já começou", async () => {
      const game = { id: 7, creatorId: 1, status: "in_progress", update: jest.fn() };
      Game.findByPk.mockResolvedValue(game);

      const result = await gameLobbyService.startGame(7, 1);

      expect(result.status).toBe(409);
      expect(result.error).toBe("Game already started");
    });

    it("deve retornar erro se jogo já terminou", async () => {
      const game = { id: 7, creatorId: 1, status: "finished", update: jest.fn() };
      Game.findByPk.mockResolvedValue(game);

      const result = await gameLobbyService.startGame(7, 1);

      expect(result.status).toBe(409);
      expect(result.error).toBe("Game already ended");
    });

    it("deve retornar erro se usuário não for o criador", async () => {
      const game = { id: 7, creatorId: 1, status: "waiting", update: jest.fn() };
      Game.findByPk.mockResolvedValue(game);

      const result = await gameLobbyService.startGame(7, 2);

      expect(result.status).toBe(403);
      expect(result.error).toBe("Only the game creator can start the game");
    });

    it("deve retornar erro se jogo não existir", async () => {
      Game.findByPk.mockResolvedValue(null);

      const result = await gameLobbyService.startGame(7, 1);

      expect(result.status).toBe(404);
      expect(result.error).toBe("Game not found");
    });
  });

  // 13. Deixar o jogo em andamento
  describe("leaveGame", () => {
    it("deve permitir que o jogador saia do jogo em andamento", async () => {
      const game = { id: 7, status: "in_progress" };
      Game.findByPk.mockResolvedValue(game);

      playerGameRepo.findByGameAndUser.mockResolvedValue({ id: 999 });
      playerGameRepo.removeByGameAndUser.mockResolvedValue(1);

      const result = await gameLobbyService.leaveGame(7, 50);

      expect(result.status).toBe(200);
      expect(result.data.message).toBe("User left the game successfully");
      expect(playerGameRepo.removeByGameAndUser).toHaveBeenCalledWith(7, 50);
    });

    it("deve retornar erro se o jogo não estiver em andamento", async () => {
      Game.findByPk.mockResolvedValue({ id: 7, status: "waiting" });

      const result = await gameLobbyService.leaveGame(7, 50);

      expect(result.status).toBe(409);
      expect(result.error).toBe("Game is not in progress");
    });

    it("deve retornar erro se o jogador não estiver no jogo", async () => {
      Game.findByPk.mockResolvedValue({ id: 7, status: "in_progress" });
      playerGameRepo.findByGameAndUser.mockResolvedValue(null);

      const result = await gameLobbyService.leaveGame(7, 50);

      expect(result.status).toBe(404);
      expect(result.error).toBe("User is not part of this game");
    });
  });

  // 14. Final do jogo
  describe("endGame", () => {
    it("deve finalizar o jogo com sucesso", async () => {
      const game = { id: 7, creatorId: 1, status: "in_progress", update: jest.fn() };
      Game.findByPk.mockResolvedValue(game);

      const result = await gameLobbyService.endGame(7, 1);

      expect(result.status).toBe(200);
      expect(result.data.message).toBe("Game ended successfully");
      expect(game.update).toHaveBeenCalledWith({ status: "finished" });
    });

    it("deve retornar erro se o jogo já terminou", async () => {
      Game.findByPk.mockResolvedValue({ id: 7, creatorId: 1, status: "finished", update: jest.fn() });

      const result = await gameLobbyService.endGame(7, 1);

      expect(result.status).toBe(409);
      expect(result.error).toBe("Game already ended");
    });

    it("deve retornar erro se o usuário não for o criador", async () => {
      Game.findByPk.mockResolvedValue({ id: 7, creatorId: 1, status: "in_progress", update: jest.fn() });

      const result = await gameLobbyService.endGame(7, 2);

      expect(result.status).toBe(403);
      expect(result.error).toBe("Only the game creator can end the game");
    });
  });
});
