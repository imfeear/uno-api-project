const express = require("express");

const playerRoutes = require("./playerRoutes");
const gameRoutes = require("./gameRoutes");
const gameLobbyRoutes = require("./gameLobbyRoutes");
const cardRoutes = require("./cardRoutes");
const scoreRoutes = require("./scoreRoutes");
const unoLogic = require("../controllers/unoLogicController");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/players", playerRoutes);
router.use("/games", gameRoutes);
router.use("/games", gameLobbyRoutes);
router.use("/cards", cardRoutes);
router.use("/scores", scoreRoutes);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
// src/routes/unoLogicRoutes.js



router.post("/nextTurn", unoLogic.nextTurn);
router.post("/playCard", unoLogic.playCard);
router.post("/drawCard", unoLogic.drawCard);

module.exports = router;


module.exports = router;
