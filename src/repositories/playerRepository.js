const { Player } = require("../models");

async function create(data) {
  return Player.create(data);
}

async function findById(id) {
  return Player.findByPk(id);
}

async function findAll() {
  return Player.findAll({ order: [["id", "ASC"]] });
}

async function findByEmail(email) {
  return Player.findOne({ where: { email } });
}

async function update(id, data) {
  const entity = await Player.findByPk(id);
  if (!entity) return null;
  await entity.update(data);
  return entity;
}

async function remove(id) {
  const entity = await Player.findByPk(id);
  if (!entity) return null;
  await entity.destroy();
  return true;
}

module.exports = { create, findById, findAll, findByEmail, update, remove };
