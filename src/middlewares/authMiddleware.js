const authService = require("../services/authService");

function extractToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (header && typeof header === "string") {
    const parts = header.split(" ");
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1];
    }
  }

  // Fallback for the spec in the screenshots
  if (req.body && typeof req.body.access_token === "string") {
    return req.body.access_token;
  }

  return null;
}

module.exports = (req, res, next) => {
  const token = extractToken(req);
  const result = authService.verifyToken(token);

  if (result.error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = { id: result.payload.userId };
  req.accessToken = token;
  return next();
};
