// src/tests/gameController.test.js
// Testes 15-19 (Game Controller)

jest.mock("../../src/services/gameService", () => ({
  create: jest.fn(),
  getById: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),

  getGameById: jest.fn(),
  getPlayersByGame: jest.fn(),
  getCurrentPlayer: jest.fn()
}));

jest.mock("../../src/repositories/cardRepository", () => ({
  findTopCardByGame: jest.fn()
}));

jest.mock("../../src/services/scoreService", () => ({
  getCurrentScores: jest.fn()
}));

describe("Game Controller Unit Tests (15-19)", () => {
  let controller;
  let gameService;
  let cardRepo;
  let scoreService;

  function makeRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  }

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    gameService = require("../../src/services/gameService");
    cardRepo = require("../../src/repositories/cardRepository");
    scoreService = require("../../src/services/scoreService");
    controller = require("../../src/controllers/gameController");
  });

  // 15. Obter o estado atual do jogo
  describe("15) getGameState", () => {
    it("deve retornar o estado do jogo com sucesso", async () => {
      const req = { body: { game_id: 10 } };
      const res = makeRes();
      const next = jest.fn();

      gameService.getGameById.mockResolvedValue({ id: 10, status: "in_progress" });

      await controller.getGameState(req, res, next);

      expect(gameService.getGameById).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith({ game_id: 10, state: "in_progress" });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve lançar erro 400 quando game_id não for informado", async () => {
      const req = { body: {} };
      const res = makeRes();

      await expect(controller.getGameState(req, res)).rejects.toMatchObject({
        message: "game_id is required",
        status: 400,
        code: "VALIDATION_ERROR"
      });
    });

    it("deve retornar 404 quando o jogo não existir", async () => {
      const req = { body: { game_id: 999 } };
      const res = makeRes();
      const next = jest.fn();

      gameService.getGameById.mockResolvedValue(null);

      await controller.getGameState(req, res, next);

      expect(gameService.getGameById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Game not found" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // 16. Obter lista de jogadores no jogo
  describe("16) getGamePlayers", () => {
    it("deve retornar a lista de jogadores com sucesso (via query.game_id)", async () => {
      const req = { query: { game_id: "7" }, body: {} };
      const res = makeRes();
      const next = jest.fn();

      const players = [{ id: 1, name: "Ana" }, { id: 2, name: "Bruno" }];
      gameService.getPlayersByGame.mockResolvedValue(players);

      await controller.getGamePlayers(req, res, next);

      expect(gameService.getPlayersByGame).toHaveBeenCalledWith(7);
      expect(res.json).toHaveBeenCalledWith({ game_id: 7, players });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve lançar erro 400 quando game_id for inválido", async () => {
      const req = { query: { game_id: "abc" }, body: {} };
      const res = makeRes();

      await expect(controller.getGamePlayers(req, res)).rejects.toMatchObject({
        message: "Invalid game_id",
        status: 400,
        code: "VALIDATION_ERROR"
      });
    });

    it("deve retornar 404 quando o jogo não existir (service retorna null)", async () => {
      const req = { query: { game_id: "123" }, body: {} };
      const res = makeRes();
      const next = jest.fn();

      gameService.getPlayersByGame.mockResolvedValue(null);

      await controller.getGamePlayers(req, res, next);

      expect(gameService.getPlayersByGame).toHaveBeenCalledWith(123);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Game not found" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // 17. Obter o jogador atual
  describe("17) getCurrentPlayer", () => {
    it("deve retornar o jogador atual com sucesso (prioriza username; fallback para name)", async () => {
      const req = { body: { game_id: 5 } };
      const res = makeRes();
      const next = jest.fn();

      gameService.getCurrentPlayer.mockResolvedValue({ id: 9, username: "player9", name: "Player 9" });

      await controller.getCurrentPlayer(req, res, next);

      expect(gameService.getCurrentPlayer).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith({
        game_id: 5,
        current_player: "player9"
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve lançar erro 400 quando game_id não for informado", async () => {
      const req = { body: {} };
      const res = makeRes();

      await expect(controller.getCurrentPlayer(req, res)).rejects.toMatchObject({
        message: "game_id is required",
        status: 400,
        code: "VALIDATION_ERROR"
      });
    });

    it("deve retornar 404 quando não houver jogo/jogadores (service retorna null)", async () => {
      const req = { body: { game_id: 5 } };
      const res = makeRes();
      const next = jest.fn();

      gameService.getCurrentPlayer.mockResolvedValue(null);

      await controller.getCurrentPlayer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Game not found or no players" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // 18. Obter a carta superior da pilha de descarte
  describe("18) getTopCard", () => {
    it("deve retornar a carta do topo com sucesso", async () => {
      const req = { body: { game_id: 3 } };
      const res = makeRes();
      const next = jest.fn();

      cardRepo.findTopCardByGame.mockResolvedValue({ value: "5", color: "red" });

      await controller.getTopCard(req, res, next);

      expect(cardRepo.findTopCardByGame).toHaveBeenCalledWith(3);
      expect(res.json).toHaveBeenCalledWith({
        game_id: 3,
        top_card: "5 of red"
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve lançar erro 400 quando game_id não for informado", async () => {
      const req = { body: {} };
      const res = makeRes();

      await expect(controller.getTopCard(req, res)).rejects.toMatchObject({
        message: "game_id is required",
        status: 400,
        code: "VALIDATION_ERROR"
      });
    });

    it("deve lançar erro 400 quando game_id for inválido", async () => {
      const req = { body: { game_id: "abc" } };
      const res = makeRes();

      await expect(controller.getTopCard(req, res)).rejects.toMatchObject({
        message: "Invalid game_id",
        status: 400,
        code: "VALIDATION_ERROR"
      });
    });

    it("deve retornar 404 quando não houver cartas (pilha vazia)", async () => {
      const req = { body: { game_id: 3 } };
      const res = makeRes();
      const next = jest.fn();

      cardRepo.findTopCardByGame.mockResolvedValue(null);

      await controller.getTopCard(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No cards found for this game" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // 19. Obter pontuações atuais de todos os jogadores
  describe("19) getCurrentScores", () => {
    it("deve retornar as pontuações com sucesso", async () => {
      const req = { body: { game_id: 11 } };
      const res = makeRes();
      const next = jest.fn();

      scoreService.getCurrentScores.mockResolvedValue({
        status: 200,
        data: { game_id: 11, scores: { Ana: 10, Bruno: 30 } }
      });

      await controller.getCurrentScores(req, res, next);

      expect(scoreService.getCurrentScores).toHaveBeenCalledWith(11);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ game_id: 11, scores: { Ana: 10, Bruno: 30 } });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve repassar erro quando o scoreService retornar error (ex: game_id ausente)", async () => {
      const req = { body: {} };
      const res = makeRes();
      const next = jest.fn();

      scoreService.getCurrentScores.mockResolvedValue({
        status: 400,
        error: "game_id is required"
      });

      await controller.getCurrentScores(req, res, next);

      expect(scoreService.getCurrentScores).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "game_id is required" });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve repassar 404 quando o scoreService retornar Game not found", async () => {
      const req = { body: { game_id: 999 } };
      const res = makeRes();
      const next = jest.fn();

      scoreService.getCurrentScores.mockResolvedValue({
        status: 404,
        error: "Game not found"
      });

      await controller.getCurrentScores(req, res, next);

      expect(scoreService.getCurrentScores).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Game not found" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
