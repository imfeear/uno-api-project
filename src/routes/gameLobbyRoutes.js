const express = require("express");
const c = require("../controllers/gameLobbyController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

//Criar jogos

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
 *                 description: Nome ou título do lobby
 *                 example: "Meu Jogo de UNO"
 *               rules:
 *                 type: string
 *                 description: Regras customizadas da partida
 *                 example: "Sem empilhar +4"
 *               max_players:
 *                 type: integer
 *                 description: Número máximo de jogadores
 *                 example: 4
 *     responses:
 *       201:
 *         description: Lobby criado com sucesso
 *       400:
 *         description: "Erro ao criar lobby (ex: nome faltando)"
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
 *       404:
 *         description: Jogo não encontrado
 */
router.post("/join", auth, c.joinGame);

// Marcar jogador como pronto e iniciar jogo

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

// Iniciar jogo quando todos os jogadores estiverem prontos

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

module.exports = router;
