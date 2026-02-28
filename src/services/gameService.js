const repo = require("../repositories/gameRepository");

function validateCreate(payload) {
  const { title, status, maxPlayers } = payload;
  if (!title || typeof title !== "string") return "title is required";
  if (status && typeof status !== "string") return "status must be a string";
  if (maxPlayers !== undefined && (!Number.isInteger(maxPlayers) || maxPlayers <= 0)) {
    return "maxPlayers must be an integer > 0";
  }
  return null;
}

async function create(payload) {
  const err = validateCreate(payload);
  if (err) return { error: err, status: 400 };

  const created = await repo.create(payload);
  return { data: created, status: 201 };
}

async function getById(id) {
  const entity = await repo.findById(id);
  if (!entity) return { error: "game not found", status: 404 };
  return { data: entity, status: 200 };
}

async function list() {
  const items = await repo.findAll();
  return { data: items, status: 200 };
}

async function update(id, payload) {
  const entity = await repo.update(id, payload);
  if (!entity) return { error: "game not found", status: 404 };
  return { data: entity, status: 200 };
}

async function remove(id) {
  const ok = await repo.remove(id);
  if (!ok) return { error: "game not found", status: 404 };
  return { status: 204 };
}

async function getGameById(gameId) {
  const id = Number(gameId);
  if (isNaN(id)) return null;

  const { Game } = require("../models");
  return await Game.findByPk(id);
}

async function getPlayersByGame(gameId) {
  const id = Number(gameId);
  if (isNaN(id)) return null;

  return await repo.findPlayersByGame(id);
}

// Feature 12
async function getCurrentPlayer(gameId) {
  const id = Number(gameId);
  if (isNaN(id)) return null;

  const game = await repo.findGameWithPlayers(id);
  if (!game || !game.users || game.users.length === 0) return null;

  const index = game.current_player_index || 0;
  return game.users[index];
}

async function findAll() {
  const { Game } = require("../models");
  return await Game.findAll();
}

module.exports = {
  create,
  getById,
  list,
  update,
  remove,
  getGameById,
  getPlayersByGame,
  getCurrentPlayer,
  findAll
};
