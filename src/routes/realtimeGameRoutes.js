const express = require("express");
const auth = require("../middlewares/authMiddleware");
const c = require("../controllers/realtimeGameController");

const router = express.Router();

/**
 * @swagger
 * /realtime-game/state:
 *   post:
 *     summary: Retorna o estado da partida em tempo real para o jogador autenticado
 *     tags: [Realtime Game]
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
 *         description: Estado da partida retornado com sucesso
 *       404:
 *         description: Partida não encontrada
 */
router.post("/state", auth, c.state);

/**
 * @swagger
 * /realtime-game/play:
 *   post:
 *     summary: Joga uma carta da mão do jogador autenticado
 *     tags: [Realtime Game]
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
 *               - card_index
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *               card_index:
 *                 type: integer
 *                 example: 0
 *               chosen_color:
 *                 type: string
 *                 enum: [red, yellow, green, blue]
 *                 example: blue
 *                 description: Obrigatório quando a carta jogada for wild ou wild_draw4
 *     responses:
 *       200:
 *         description: Carta jogada com sucesso
 *       400:
 *         description: Índice inválido ou chosen_color ausente para wild
 *       409:
 *         description: Não é o turno do jogador ou jogada inválida
 */
router.post("/play", auth, c.play);

/**
 * @swagger
 * /realtime-game/draw:
 *   post:
 *     summary: Compra uma carta do baralho
 *     tags: [Realtime Game]
 *     security:
 *       - bearerAuth: []
 *     description: O jogador só pode comprar se não tiver nenhuma carta jogável na mão durante o turno.
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
 *         description: Carta comprada com sucesso
 *       409:
 *         description: Não é o turno do jogador, baralho vazio ou já existe carta jogável na mão
 */
router.post("/draw", auth, c.draw);

/**
 * @swagger
 * /realtime-game/uno:
 *   post:
 *     summary: Declara UNO quando o jogador estiver com exatamente 1 carta na mão
 *     tags: [Realtime Game]
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
 *         description: UNO declarado com sucesso
 *       409:
 *         description: O jogador não está com exatamente 1 carta
 */
router.post("/uno", auth, c.uno);

module.exports = router;