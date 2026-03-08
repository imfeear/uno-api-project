const express = require("express");
const gameController = require("../controllers/game");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Cria um novo jogo
 *     tags: [Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Partida 1
 *               status:
 *                 type: string
 *                 example: waiting
 *               maxPlayers:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Jogo criado com sucesso
 *
 *   get:
 *     summary: Lista todos os jogos
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Lista de jogos
 */
router.post("/", asyncHandler(gameController.create));
router.get("/", asyncHandler(gameController.list));

/**
 * @swagger
 * /games/state:
 *   post:
 *     summary: Retorna o estado atual de um jogo
 *     tags: [Games]
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
 *         description: Estado do jogo retornado com sucesso
 *       404:
 *         description: Game não encontrado
 */
router.post("/state", asyncHandler(gameController.getGameState));

/**
 * @swagger
 * /games/players:
 *   post:
 *     summary: Lista os jogadores vinculados a um jogo
 *     tags: [Games]
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
 *         description: Jogadores retornados com sucesso
 *       404:
 *         description: Game não encontrado
 */
router.post("/players", asyncHandler(gameController.getGamePlayers));

/**
 * @swagger
 * /games/current-player:
 *   post:
 *     summary: Retorna o jogador atual do jogo
 *     tags: [Games]
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
 *         description: Jogador atual retornado com sucesso
 *       404:
 *         description: Game não encontrado ou sem jogadores
 */
router.post("/current-player", asyncHandler(gameController.getCurrentPlayer));

/**
 * @swagger
 * /games/top-card:
 *   post:
 *     summary: Retorna a carta do topo da pilha de um jogo
 *     tags: [Games]
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
 *         description: Carta do topo retornada com sucesso
 *       404:
 *         description: Game não encontrado ou sem cartas
 */
router.post("/top-card", asyncHandler(gameController.getTopCard));

/**
 * @swagger
 * /games/scores:
 *   post:
 *     summary: Retorna o placar atual do jogo
 *     tags: [Games]
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
 *         description: Placar retornado com sucesso
 *       404:
 *         description: Game não encontrado
 */
router.post("/scores", asyncHandler(gameController.getCurrentScores));

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Busca um jogo por ID
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Jogo encontrado
 *       404:
 *         description: Jogo não encontrado
 *
 *   put:
 *     summary: Atualiza um jogo por ID
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Partida Atualizada
 *               status:
 *                 type: string
 *                 example: in_progress
 *               maxPlayers:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: Jogo atualizado com sucesso
 *       404:
 *         description: Jogo não encontrado
 *
 *   delete:
 *     summary: Remove um jogo por ID
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Jogo removido com sucesso
 *       404:
 *         description: Jogo não encontrado
 */
router.get("/:id", asyncHandler(gameController.getById));
router.put("/:id", asyncHandler(gameController.update));
router.delete("/:id", asyncHandler(gameController.remove));

module.exports = router;