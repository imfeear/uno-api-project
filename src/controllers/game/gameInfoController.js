const service = require("../../services/gameService");
const cardRepo = require("../../repositories/cardRepository");
const scoreService = require("../../services/scoreService");
const { requirePositiveInt } = require("../../validators/numberValidators");

async function getGameState(req, res) {
  const gameId = requirePositiveInt(req.body.game_id, "game_id");
  const game = await service.getGameById(gameId);
  if (!game) return res.status(404).json({ error: "Game not found" });

  return res.json({ game_id: game.id, state: game.status });
}

async function getGamePlayers(req, res) {
  const raw = req.query.game_id || req.body.game_id;
  const gameId = requirePositiveInt(raw, "game_id");

  const game = await service.getGameById(gameId);
  if (!game) return res.status(404).json({ error: "Game not found" });

  const players = await service.getPlayersByGame(gameId);
  return res.json({ game_id: gameId, players });
}

async function getCurrentPlayer(req, res) {
  const gameId = requirePositiveInt(req.body.game_id, "game_id");

  const currentPlayer = await service.getCurrentPlayer(gameId);
  if (!currentPlayer) {
    return res.status(404).json({ error: "Game not found or no players" });
  }

  return res.json({
    game_id: gameId,
    current_player: currentPlayer.username || currentPlayer.name,
  });
}

async function getTopCard(req, res) {
  const gameId = requirePositiveInt(req.body.game_id, "game_id");

  const game = await service.getGameById(gameId);
  if (!game) return res.status(404).json({ error: "Game not found" });

  const top = await cardRepo.findTopCardByGame(gameId);
  if (!top) return res.status(404).json({ error: "No cards found for this game" });

  return res.json({
    game_id: gameId,
    top_card: {
      id: top.id,
      color: top.color,
      value: top.value,
    },
  });
}

async function getCurrentScores(req, res) {
  const gameId = req.body.game_id;
  const result = await scoreService.getCurrentScores(gameId);

  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.data);
}

module.exports = {
  getGameState,
  getGamePlayers,
  getCurrentPlayer,
  getTopCard,
  getCurrentScores,
};