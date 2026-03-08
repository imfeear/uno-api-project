const service = require("../../services/gameService");
const scoreService = require("../../services/scoreService");
const gameStateRepo = require("../../repositories/gameStateRepository");
const playerGameRepo = require("../../repositories/playerGameRepository");
const { requirePositiveInt } = require("../../validators/numberValidators");

async function getGameState(req, res) {
  const gameId = requirePositiveInt(req.body.game_id, "game_id");
  const game = await service.getGameById(gameId);
  if (!game) return res.status(404).json({ error: "Game not found" });

  const state = await gameStateRepo.findByGameId(gameId);

  return res.json({
    game_id: game.id,
    state: {
      status: game.status,
      started: !!state?.started,
      currentPlayerIndex: state?.currentPlayerIndex ?? 0,
      direction: state?.direction ?? 1,
      topCard: state?.discardPile?.length
        ? state.discardPile[state.discardPile.length - 1]
        : null,
      winnerUserId: state?.winnerUserId ?? null
    }
  });
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

  const state = await gameStateRepo.findByGameId(gameId);
  if (!state) {
    return res.status(404).json({ error: "Game state not found" });
  }

  const players = await playerGameRepo.findByGame(gameId);
  const current = players[state.currentPlayerIndex];

  if (!current) {
    return res.status(404).json({ error: "Current player not found" });
  }

  return res.json({
    game_id: gameId,
    current_player: current.user?.username || `User ${current.userId}`,
    current_player_id: current.userId
  });
}

async function getTopCard(req, res) {
  const gameId = requirePositiveInt(req.body.game_id, "game_id");

  const game = await service.getGameById(gameId);
  if (!game) return res.status(404).json({ error: "Game not found" });

  const state = await gameStateRepo.findByGameId(gameId);
  if (!state || !state.discardPile?.length) {
    return res.status(404).json({ error: "No discard pile found for this game" });
  }

  const top = state.discardPile[state.discardPile.length - 1];

  return res.json({
    game_id: gameId,
    top_card: top
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