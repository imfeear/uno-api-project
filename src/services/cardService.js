const repo = require("../repositories/cardRepository");

function validateCreate(payload) {
  const { color, value, gameId } = payload;
  if (!color || typeof color !== "string") return "color is required";
  if (!value || typeof value !== "string") return "value is required";
  if (!Number.isInteger(gameId)) return "gameId must be an integer";
  return null;
}

async function create(payload) {
  const err = validateCreate(payload);
  if (err) return { error: err, status: 400 };

  const gameOk = await repo.gameExists(payload.gameId);
  if (!gameOk) return { error: "gameId not found", status: 404 };

  const created = await repo.create(payload);
  return { data: created, status: 201 };
}

async function getById(id) {
  const entity = await repo.findById(id);
  if (!entity) return { error: "card not found", status: 404 };
  return { data: entity, status: 200 };
}

async function list() {
  const items = await repo.findAll();
  return { data: items, status: 200 };
}

async function update(id, payload) {
  if (payload.gameId !== undefined) {
    if (!Number.isInteger(payload.gameId)) return { error: "gameId must be an integer", status: 400 };
    const gameOk = await repo.gameExists(payload.gameId);
    if (!gameOk) return { error: "gameId not found", status: 404 };
  }

  const entity = await repo.update(id, payload);
  if (!entity) return { error: "card not found", status: 404 };
  return { data: entity, status: 200 };
}

async function remove(id) {
  const ok = await repo.remove(id);
  if (!ok) return { error: "card not found", status: 404 };
  return { status: 204 };
}

module.exports = { create, getById, list, update, remove };
