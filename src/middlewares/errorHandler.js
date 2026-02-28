// src/middlewares/errorHandler.js
const AppError = require("../errors/AppError");

function isSequelizeError(err) {
  return err && (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError");
}

module.exports = (err, req, res, next) => {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
      details: err.details,
      requestId
    });
  }

  if (isSequelizeError(err)) {
    const details = Array.isArray(err.errors)
      ? err.errors.map(e => ({ message: e.message, path: e.path, value: e.value }))
      : null;

    return res.status(400).json({
      error: "validation error",
      code: "VALIDATION_ERROR",
      details,
      requestId
    });
  }

  console.error(`[${requestId}]`, err);

  const isProd = process.env.NODE_ENV === "production";

  return res.status(500).json({
    error: "internal server error",
    code: "INTERNAL_ERROR",
    requestId,
    ...(isProd ? {} : { debug: { message: err.message, stack: err.stack } })
  });
};
