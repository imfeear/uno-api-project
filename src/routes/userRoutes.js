const express = require("express");
const c = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *       401:
 *         description: Token inválido ou ausente
 *
 *   post:
 *     summary: Retorna o perfil do usuário a partir de um access_token enviado no body
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
 *                 example: seu_jwt_aqui
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *       401:
 *         description: Token inválido
 */
router.get("/profile", c.profile);
router.post("/profile", c.profile);

module.exports = router;