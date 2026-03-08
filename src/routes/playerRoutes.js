const express = require("express");
const c = require("../controllers/playerController");

const router = express.Router();

/**
 * @swagger
 * /players:
 *   post:
 *     summary: Cria um novo player
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bruno
 *               age:
 *                 type: integer
 *                 example: 20
 *               email:
 *                 type: string
 *                 example: bruno@email.com
 *     responses:
 *       201:
 *         description: Player criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já está em uso
 *
 *   get:
 *     summary: Lista todos os players
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Lista de players
 */
router.post("/", c.create);
router.get("/", c.list);

/**
 * @swagger
 * /players/{id}:
 *   get:
 *     summary: Busca um player por ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Player encontrado
 *       404:
 *         description: Player não encontrado
 *
 *   put:
 *     summary: Atualiza um player por ID
 *     tags: [Players]
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
 *               name:
 *                 type: string
 *                 example: Bruno Atualizado
 *               age:
 *                 type: integer
 *                 example: 21
 *               email:
 *                 type: string
 *                 example: novoemail@email.com
 *     responses:
 *       200:
 *         description: Player atualizado com sucesso
 *       404:
 *         description: Player não encontrado
 *
 *   delete:
 *     summary: Remove um player por ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Player removido com sucesso
 *       404:
 *         description: Player não encontrado
 */
router.get("/:id", c.getById);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;