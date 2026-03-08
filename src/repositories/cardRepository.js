const { Card, Game } = require("../models");

async function create(data) {
  return Card.create(data);
}

async function findById(id) {
  return Card.findByPk(id);
}

async function findAll() {
  return Card.findAll({ order: [["id", "ASC"]] });
}

async function gameExists(gameId) {
  const g = await Game.findByPk(gameId);
  return !!g;
}

async function update(id, data) {
  const entity = await Card.findByPk(id);
  if (!entity) return null;
  await entity.update(data);
  return entity;
}

async function remove(id) {
  const entity = await Card.findByPk(id);
  if (!entity) return null;
  await entity.destroy();
  return true;
}

async function findTopCardByGame(gameId) {
  return Card.findOne({
    where: { gameId },
    order: [["id", "DESC"]],
  });
}

module.exports = {
  create,
  findById,
  findAll,
  gameExists,
  update,
  remove,
  findTopCardByGame,
};