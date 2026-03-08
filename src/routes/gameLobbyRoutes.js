const express = require("express");
const c = require("../controllers/gameLobbyController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /game-lobby/create:
 *   post:
 *     summary: Cria um novo lobby
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sala do Bruno
 *               rules:
 *                 type: string
 *                 example: Regras padrão
 *               max_players:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Lobby criado com sucesso
 */
router.post("/create", auth, c.createGame);

/**
 * @swagger
 * /game-lobby/join:
 *   post:
 *     summary: Entra em um lobby existente
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Entrou no lobby com sucesso
 */
router.post("/join", auth, c.joinGame);

/**
 * @swagger
 * /game-lobby/ready:
 *   post:
 *     summary: Marca o jogador como pronto
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Jogador marcado como pronto
 */
router.post("/ready", auth, c.ready);

/**
 * @swagger
 * /game-lobby/start:
 *   post:
 *     summary: Inicia o jogo e distribui as cartas iniciais
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Jogo iniciado com sucesso
 */
router.post("/start", auth, c.start);

/**
 * @swagger
 * /game-lobby/leave:
 *   post:
 *     summary: Sai do jogo
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Saiu do jogo com sucesso
 */
router.post("/leave", auth, c.leave);

/**
 * @swagger
 * /game-lobby/end:
 *   post:
 *     summary: Encerra o jogo
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Jogo encerrado com sucesso
 */
router.post("/end", auth, c.end);

/**
 * @swagger
 * /game-lobby/state:
 *   post:
 *     summary: Consulta o estado atual do lobby
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Estado do lobby retornado com sucesso
 */
router.post("/state", auth, c.state);

module.exports = router;