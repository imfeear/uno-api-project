const express = require("express");
const c = require("../controllers/gameLobbyController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /game-lobby/create:
 *   post:
 *     summary: Criar um novo lobby de Uno
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
 *                 example: Meu Jogo de UNO
 *               rules:
 *                 type: string
 *                 example: Sem empilhar +4
 *               max_players:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Lobby criado com sucesso
 */
router.post("/create", auth, c.createGame);

/**
 * @swagger
 * /game-lobby/join:
 *   post:
 *     summary: Entrar em um jogo existente
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Entrou no jogo com sucesso
 */
router.post("/join", auth, c.joinGame);

/**
 * @swagger
 * /game-lobby/ready:
 *   post:
 *     summary: Marcar jogador como pronto
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *     summary: Iniciar o jogo
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Jogo iniciado
 */
router.post("/start", auth, c.start);

/**
 * @swagger
 * /game-lobby/leave:
 *   post:
 *     summary: Sair do jogo atual
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Jogador saiu do jogo
 */
router.post("/leave", auth, c.leave);

/**
 * @swagger
 * /game-lobby/end:
 *   post:
 *     summary: Encerrar o jogo
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Jogo encerrado
 */
router.post("/end", auth, c.end);

/**
 * @swagger
 * /game-lobby/state:
 *   post:
 *     summary: Consultar estado do lobby
 *     tags: [Game Lobby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Estado do lobby retornado
 */
router.post("/state", auth, c.state);

module.exports = router;