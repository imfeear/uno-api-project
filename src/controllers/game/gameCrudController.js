// src/controllers/game/gameCrudController.js
const service = require("../../services/gameService");
const AppError = require("../../errors/AppError");

async function create(req, res) {
  const result = await service.create(req.body);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.data);
}

async function getById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", { field: "id" });

  const result = await service.getById(id);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.data);
}

async function list(req, res) {
  const result = await service.list();
  return res.status(result.status).json(result.data);
}

async function update(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", { field: "id" });

  const result = await service.update(id, req.body);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.data);
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError("Invalid ID", 400, "VALIDATION_ERROR", { field: "id" });

  const result = await service.remove(id);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(204).send();
}

module.exports = { create, getById, list, update, remove };
