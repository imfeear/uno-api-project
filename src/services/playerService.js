const repo = require("../repositories/playerRepository");

function validateCreate(payload) {
  const { name, age, email } = payload;
  if (!name || typeof name !== "string") return "name is required";
  if (!Number.isInteger(age) || age < 0) return "age must be an integer >= 0";
  if (!email || typeof email !== "string") return "email is required";
  return null;
}

async function create(payload) {
  const err = validateCreate(payload);
  if (err) return { error: err, status: 400 };

  const exists = await repo.findByEmail(payload.email);
  if (exists) return { error: "email already in use", status: 409 };

  const created = await repo.create(payload);
  return { data: created, status: 201 };
}

async function getById(id) {
  const entity = await repo.findById(id);
  if (!entity) return { error: "player not found", status: 404 };
  return { data: entity, status: 200 };
}

async function list() {
  const items = await repo.findAll();
  return { data: items, status: 200 };
}

async function update(id, payload) {
  const entity = await repo.update(id, payload);
  if (!entity) return { error: "player not found", status: 404 };
  return { data: entity, status: 200 };
}

async function remove(id) {
  const ok = await repo.remove(id);
  if (!ok) return { error: "player not found", status: 404 };
  return { status: 204 };
}

module.exports = { create, getById, list, update, remove };
