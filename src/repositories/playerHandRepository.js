const { PlayerHand, User } = require("../models");

async function create(data) {
  return PlayerHand.create(data);
}

async function findByGameId(gameId) {
  return PlayerHand.findAll({
    where: { gameId },
    include: [{ model: User, as: "user", attributes: ["id", "username"] }],
    order: [["id", "ASC"]],
  });
}

async function findByGameAndUser(gameId, userId) {
  return PlayerHand.findOne({ where: { gameId, userId } });
}

async function updateCards(id, cards) {
  const hand = await PlayerHand.findByPk(id);
  if (!hand) return null;
  await hand.update({ cards });
  return hand;
}

async function updateUnoState(id, data) {
  const hand = await PlayerHand.findByPk(id);
  if (!hand) return null;
  await hand.update(data);
  return hand;
}

async function removeByGameAndUser(gameId, userId) {
  const hand = await PlayerHand.findOne({ where: { gameId, userId } });
  if (!hand) return false;
  await hand.destroy();
  return true;
}

module.exports = {
  create,
  findByGameId,
  findByGameAndUser,
  updateCards,
  updateUnoState,
  removeByGameAndUser,
};