const authService = require("../services/authService");

// Supports both:
// 1) GET /api/users/profile with Authorization: Bearer <token>
// 2) POST /api/users/profile with { "access_token": "..." }

async function profile(req, res, next) {
  try {
    const tokenFromHeader = (() => {
      const h = req.headers.authorization || req.headers.Authorization;
      if (!h || typeof h !== "string") return null;
      const parts = h.split(" ");
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
      return null;
    })();

    const token = tokenFromHeader || (req.body && req.body.access_token);
    const result = await authService.getProfileByToken(token);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (e) {
    next(e);
  }
}

module.exports = { profile };
