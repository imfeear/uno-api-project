const service = require("../services/authService");

async function register(req, res, next) {
  try {
    const result = await service.register(req.body || {});
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const result = await service.login(req.body || {});
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

function logout(req, res, next) {
  try {
    const result = service.logout(req.body || {});
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, logout };
