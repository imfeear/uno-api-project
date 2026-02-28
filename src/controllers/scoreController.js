const service = require("../services/scoreService");

async function create(req, res, next) {
  try {
    const result = await service.create(req.body);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = await service.getById(id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const result = await service.list();
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = await service.update(id, req.body);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = await service.remove(id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { create, getById, list, update, remove };
