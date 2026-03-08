const { GameState } = require("../models");

async function create(data) {
  return GameState.create(data);
}

async function findByGameId(gameId) {
  return GameState.findOne({ where: { gameId } });
}

async function updateByGameId(gameId, data) {
  const entity = await GameState.findOne({ where: { gameId } });
  if (!entity) return null;
  await entity.update(data);
  return entity;
}

module.exports = {
  create,
  findByGameId,
  updateByGameId,
};