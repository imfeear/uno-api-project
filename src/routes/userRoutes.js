const express = require("express");
const c = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado via Bearer Token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: jogador1
 *                 email:
 *                   type: string
 *                   example: jogador1@email.com
 *       401:
 *         description: Token ausente, inválido ou expirado
 *
 *   post:
 *     summary: Retorna o perfil do usuário a partir do access_token enviado no body
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *                 example: seu_token_jwt_aqui
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: jogador1
 *                 email:
 *                   type: string
 *                   example: jogador1@email.com
 *       401:
 *         description: Token ausente, inválido ou expirado
 */
router.get("/profile", c.profile);
router.post("/profile", c.profile);

module.exports = router;