const express = require("express");

const playerRoutes = require("./playerRoutes");
const gameRoutes = require("./gameRoutes");
const gameLobbyRoutes = require("./gameLobbyRoutes");
const cardRoutes = require("./cardRoutes");
const scoreRoutes = require("./scoreRoutes");
const unoLogic = require("../controllers/unoLogicController");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const realtimeGameRoutes = require("./realtimeGameRoutes");

const router = express.Router();

router.use("/players", playerRoutes);
router.use("/games", gameRoutes);
router.use("/game-lobby", gameLobbyRoutes);
router.use("/cards", cardRoutes);
router.use("/scores", scoreRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/realtime-game", realtimeGameRoutes);

/**
 * @swagger
 * /nextTurn:
 *   post:
 *     summary: Calcula o próximo turno do jogo
 *     tags: [UNO Logic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - players
 *               - currentPlayerIndex
 *             properties:
 *               players:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Bruno", "Ana", "Carlos"]
 *               currentPlayerIndex:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       200:
 *         description: Próximo turno calculado com sucesso
 */
router.post("/nextTurn", unoLogic.nextTurn);

/**
 * @swagger
 * /playCard:
 *   post:
 *     summary: Processa a jogada de uma carta
 *     tags: [UNO Logic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardPlayed
 *               - currentPlayerIndex
 *               - players
 *               - direction
 *             properties:
 *               cardPlayed:
 *                 type: string
 *                 example: reverse
 *               currentPlayerIndex:
 *                 type: integer
 *                 example: 1
 *               players:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Bruno", "Ana", "Carlos"]
 *               direction:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Jogada processada com sucesso
 */
router.post("/playCard", unoLogic.playCard);

/**
 * @swagger
 * /drawCard:
 *   post:
 *     summary: Compra carta(s) do baralho para o jogador
 *     tags: [UNO Logic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerHand
 *               - deck
 *               - currentCard
 *             properties:
 *               playerHand:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["red_3", "blue_7"]
 *               deck:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["green_2", "yellow_9", "wild_draw4"]
 *               currentCard:
 *                 type: string
 *                 example: red_8
 *     responses:
 *       200:
 *         description: Compra processada com sucesso
 */
router.post("/drawCard", unoLogic.drawCard);

module.exports = router;