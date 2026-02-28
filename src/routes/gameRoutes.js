// src/routes/gameRoutes.js
const express = require("express");
const gameController = require("../controllers/game");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// CRUD básico
router.post("/", asyncHandler(gameController.create));
router.get("/", asyncHandler(gameController.list));
router.get("/:id", asyncHandler(gameController.getById));
router.put("/:id", asyncHandler(gameController.update));
router.delete("/:id", asyncHandler(gameController.remove));

// Extras
router.post("/state", asyncHandler(gameController.getGameState));
router.post("/players", asyncHandler(gameController.getGamePlayers));
router.post("/current-player", asyncHandler(gameController.getCurrentPlayer));
router.post("/top-card", asyncHandler(gameController.getTopCard));
router.post("/scores", asyncHandler(gameController.getCurrentScores));

module.exports = router;
