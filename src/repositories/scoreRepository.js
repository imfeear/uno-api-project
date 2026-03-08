const { Score, Player, Game } = require("../models");

async function create(data) {
  return Score.create(data);
}

async function findById(id) {
  return Score.findByPk(id);
}

async function findAll() {
  return Score.findAll({ order: [["id", "ASC"]] });
}

async function playerExists(playerId) {
  const p = await Player.findByPk(playerId);
  return !!p;
}

async function gameExists(gameId) {
  const g = await Game.findByPk(gameId);
  return !!g;
}

async function update(id, data) {
  const entity = await Score.findByPk(id);
  if (!entity) return null;
  await entity.update(data);
  return entity;
}

async function remove(id) {
  const entity = await Score.findByPk(id);
  if (!entity) return null;
  await entity.destroy();
  return true;
}

async function findByGameWithPlayer(gameId) {
  return Score.findAll({
    where: { gameId },
    include: [
      {
        model: Player,
        as: "player",
        attributes: ["id", "name"],
      },
    ],
    order: [["id", "DESC"]],
  });
}

module.exports = {
  create,
  findById,
  findAll,
  playerExists,
  gameExists,
  update,
  remove,
  findByGameWithPlayer,
};