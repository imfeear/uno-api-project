// src/validators/numberValidators.js
const AppError = require("../errors/AppError");

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
}

function requireInt(value, fieldName, status = 400) {
  if (value === undefined || value === null || value === "") {
    throw new AppError(`${fieldName} is required`, status, "VALIDATION_ERROR", { field: fieldName });
  }

  const n = toInt(value);

  if (Number.isNaN(n)) {
    throw new AppError(`Invalid ${fieldName}`, status, "VALIDATION_ERROR", { field: fieldName });
  }

  return n;
}

function requirePositiveInt(value, fieldName, status = 400) {
  const n = requireInt(value, fieldName, status);

  if (n <= 0) {
    throw new AppError(`${fieldName} must be > 0`, status, "VALIDATION_ERROR", { field: fieldName });
  }

  return n;
}

module.exports = {
  requireInt,
  requirePositiveInt
};
