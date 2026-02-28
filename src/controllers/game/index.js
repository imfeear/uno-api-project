// src/controllers/game/index.js
const crud = require("./gameCrudController");
const info = require("./gameInfoController");

module.exports = {
  ...crud,
  ...info
};
