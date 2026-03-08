const { PlayerGame, User } = require("../models");

async function create(data) {
  return PlayerGame.create(data);
}

async function findByGameAndUser(gameId, userId) {
  return PlayerGame.findOne({ where: { gameId, userId } });
}

async function findByGame(gameId) {
  return PlayerGame.findAll({
    where: { gameId },
    include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }],
    order: [["id", "ASC"]],
  });
}

async function updateReady(id, isReady) {
  const entry = await PlayerGame.findByPk(id);
  if (!entry) return null;
  await entry.update({ isReady });
  return entry;
}

async function removeByGameAndUser(gameId, userId) {
  return PlayerGame.destroy({ where: { gameId, userId } });
}

module.exports = {
  create,
  findByGameAndUser,
  findByGame,
  updateReady,
  removeByGameAndUser,
};