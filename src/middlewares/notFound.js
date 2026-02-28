// src/middlewares/notFound.js
module.exports = (req, res) => {
  res.status(404).json({
    error: "route not found",
    code: "NOT_FOUND",
    path: req.originalUrl,
    method: req.method
  });
};
