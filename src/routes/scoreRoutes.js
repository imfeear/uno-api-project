const express = require("express");
const c = require("../controllers/scoreController");

const router = express.Router();

/**
 * @swagger
 * /scores:
 *   post:
 *     summary: Cria uma nova pontuação
 *     tags: [Scores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - gameId
 *               - score
 *             properties:
 *               playerId:
 *                 type: integer
 *                 example: 1
 *               gameId:
 *                 type: integer
 *                 example: 1
 *               score:
 *                 type: integer
 *                 example: 120
 *     responses:
 *       201:
 *         description: Pontuação criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: playerId ou gameId não encontrado
 *
 *   get:
 *     summary: Lista todas as pontuações
 *     tags: [Scores]
 *     responses:
 *       200:
 *         description: Lista de pontuações
 */
router.post("/", c.create);
router.get("/", c.list);

/**
 * @swagger
 * /scores/{id}:
 *   get:
 *     summary: Busca uma pontuação por ID
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Pontuação encontrada
 *       404:
 *         description: Pontuação não encontrada
 *
 *   put:
 *     summary: Atualiza uma pontuação por ID
 *     tags: [Scores]
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
 *               playerId:
 *                 type: integer
 *                 example: 1
 *               gameId:
 *                 type: integer
 *                 example: 1
 *               score:
 *                 type: integer
 *                 example: 150
 *     responses:
 *       200:
 *         description: Pontuação atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Score, playerId ou gameId não encontrado
 *
 *   delete:
 *     summary: Remove uma pontuação por ID
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Pontuação removida com sucesso
 *       404:
 *         description: Pontuação não encontrada
 */
router.get("/:id", c.getById);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;