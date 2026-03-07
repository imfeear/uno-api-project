const express = require("express");
const c = require("../controllers/authController");

const router = express.Router();

/** * O Swagger lê comentarios especificos em forma de YAML que são usados para gerar a documentação.
 * É necessario coloca-los antes da rota para que o swagger consiga ler e gerar a documentação corretamente.
 */

// Rota de registro

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo jogador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: jogador1
 *               email:
 *                 type: string
 *                 example: jogador1@email.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: jogador registrado com sucesso
 *       400:
 *         description: Faltam dados obrigatórios
 *       409:
 *         description: jogador ou email já existe
 */
router.post("/register", c.register);

// Rota de login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sessão (Login)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: jogador1
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login bem sucedido (retorna o access_token)
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", c.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Termina a sessão (invalida o token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               access_token:
 *                 type: string
 *                 example: cole_aqui_o_seu_token_jwt
 *     responses:
 *       200:
 *         description: Sessão terminada com sucesso
 */
router.post("/logout", c.logout);

module.exports = router;