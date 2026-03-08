const { Game, PlayerGame, User } = require("../models");

async function create(data) {
  return Game.create(data);
}

async function findById(id) {
  return Game.findByPk(id);
}

async function findAll() {
  return Game.findAll({ order: [["id", "ASC"]] });
}

async function update(id, data) {
  const entity = await Game.findByPk(id);
  if (!entity) return null;
  await entity.update(data);
  return entity;
}

async function remove(id) {
  const entity = await Game.findByPk(id);
  if (!entity) return null;
  await entity.destroy();
  return true;
}

async function findPlayersByGame(gameId) {
  const playerGames = await PlayerGame.findAll({
    where: { gameId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username"],
      },
    ],
    order: [["joinedAt", "ASC"]],
  });

  return playerGames.map((pg) => (pg.user ? pg.user.username : `User ${pg.userId}`));
}

async function findGameWithPlayers(gameId) {
  return Game.findByPk(gameId, {
    include: [
      {
        model: User,
        as: "users",
        through: { attributes: [] },
        attributes: ["id", "username"],
      },
    ],
  });
}

module.exports = {
  create,
  findById,
  findAll,
  update,
  remove,
  findPlayersByGame,
  findGameWithPlayers,
};