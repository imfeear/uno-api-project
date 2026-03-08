const express = require("express");
const c = require("../controllers/cardController");

const router = express.Router();

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Cria uma nova carta
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - color
 *               - value
 *               - gameId
 *             properties:
 *               color:
 *                 type: string
 *                 example: red
 *               value:
 *                 type: string
 *                 example: 7
 *               gameId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Carta criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: gameId não encontrado
 *
 *   get:
 *     summary: Lista todas as cartas
 *     tags: [Cards]
 *     responses:
 *       200:
 *         description: Lista de cartas
 */
router.post("/", c.create);
router.get("/", c.list);

/**
 * @swagger
 * /cards/{id}:
 *   get:
 *     summary: Busca uma carta por ID
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Carta encontrada
 *       404:
 *         description: Carta não encontrada
 *
 *   put:
 *     summary: Atualiza uma carta por ID
 *     tags: [Cards]
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
 *               color:
 *                 type: string
 *                 example: blue
 *               value:
 *                 type: string
 *                 example: skip
 *               gameId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Carta atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Carta ou gameId não encontrado
 *
 *   delete:
 *     summary: Remove uma carta por ID
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Carta removida com sucesso
 *       404:
 *         description: Carta não encontrada
 */
router.get("/:id", c.getById);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;