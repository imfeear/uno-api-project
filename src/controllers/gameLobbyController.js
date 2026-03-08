const service = require("../services/gameLobbyService");

async function createGame(req, res, next) {
  try {
    const result = await service.createGame(req.body || {}, req.user && req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function joinGame(req, res, next) {
  try {
    const result = await service.joinGame(req.body && req.body.game_id, req.user && req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function ready(req, res, next) {
  try {
    const result = await service.setReady(req.body && req.body.game_id, req.user && req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function start(req, res, next) {
  try {
    const result = await service.startGame(req.body && req.body.game_id, req.user && req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function leave(req, res, next) {
  try {
    const result = await service.leaveGame(req.body && req.body.game_id, req.user && req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function end(req, res, next) {
  try {
    const result = await service.endGame(req.body && req.body.game_id, req.user && req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function state(req, res, next) {
  try {
    const result = await service.getCurrentState(req.body && req.body.game_id, req.user && req.user.id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

module.exports = { createGame, joinGame, ready, start, leave, end, state };