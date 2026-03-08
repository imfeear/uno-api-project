const realtimeGameService = require("../services/realtimeGameService");

async function state(req, res, next) {
  try {
    const gameId = Number(req.body.game_id);
    const result = await realtimeGameService.buildPlayerView(gameId, req.user.id);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function play(req, res, next) {
  try {
    const gameId = Number(req.body.game_id);
    const cardIndex = Number(req.body.card_index);
    const chosenColor = req.body.chosen_color;

    const result = await realtimeGameService.playCard(gameId, req.user.id, cardIndex, chosenColor);
    if (result.error) return res.status(result.status).json({ error: result.error });

    return res.status(200).json({ message: "Card played successfully" });
  } catch (e) {
    next(e);
  }
}

async function draw(req, res, next) {
  try {
    const gameId = Number(req.body.game_id);

    const result = await realtimeGameService.drawCard(gameId, req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });

    return res.status(200).json({ message: "Card drawn successfully" });
  } catch (e) {
    next(e);
  }
}

async function uno(req, res, next) {
  try {
    const gameId = Number(req.body.game_id);

    const result = await realtimeGameService.declareUno(gameId, req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });

    return res.status(200).json({ message: "UNO declared successfully" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  state,
  play,
  draw,
  uno,
};