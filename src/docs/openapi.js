/**
 * @swagger
 * tags:
 *   - name: Infra
 *     description: Endpoints de infraestrutura e documentação
 *   - name: Auth
 *     description: Registro, login, logout e autenticação
 *   - name: Users
 *     description: Perfil do usuário autenticado
 *   - name: Game Lobby
 *     description: Fluxo principal de criação, entrada e gerenciamento do lobby
 *   - name: Realtime Game
 *     description: Endpoints da partida em tempo real
 *   - name: Games
 *     description: CRUD e consultas auxiliares de jogos
 *   - name: Players
 *     description: CRUD de jogadores persistidos
 *   - name: Cards
 *     description: CRUD de cartas persistidas
 *   - name: Scores
 *     description: CRUD de pontuações persistidas
 *   - name: UNO Logic
 *     description: Endpoints isolados de lógica do jogo
 *
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Invalid token
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Operation completed successfully
 *     AuthRegisterRequest:
 *       type: object
 *       required: [username, email, password]
 *       properties:
 *         username:
 *           type: string
 *           example: bruno_teste
 *         email:
 *           type: string
 *           format: email
 *           example: bruno_teste@email.com
 *         password:
 *           type: string
 *           format: password
 *           example: 123456
 *     AuthLoginRequest:
 *       type: object
 *       required: [username, password]
 *       properties:
 *         username:
 *           type: string
 *           example: bruno_teste
 *         password:
 *           type: string
 *           format: password
 *           example: 123456
 *     AuthTokenResponse:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example
 *     AuthLogoutRequest:
 *       type: object
 *       required: [access_token]
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: bruno_teste
 *         email:
 *           type: string
 *           format: email
 *           example: bruno_teste@email.com
 *     LobbyActionRequest:
 *       type: object
 *       required: [game_id]
 *       properties:
 *         game_id:
 *           type: integer
 *           example: 1
 *     CreateLobbyRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: Sala do Bruno
 *         rules:
 *           type: string
 *           example: Sem empilhar +4
 *         max_players:
 *           type: integer
 *           example: 4
 *     LobbyPlayer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: bruno_teste
 *         email:
 *           type: string
 *           format: email
 *           example: bruno_teste@email.com
 *         isReady:
 *           type: boolean
 *           example: true
 *         joinedAt:
 *           type: string
 *           format: date-time
 *     LobbyStateResponse:
 *       type: object
 *       properties:
 *         game_id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Sala do Bruno
 *         rules:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [waiting, in_progress, finished]
 *           example: waiting
 *         maxPlayers:
 *           type: integer
 *           example: 4
 *         creatorId:
 *           type: integer
 *           example: 1
 *         players:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LobbyPlayer'
 *     RealtimePlayRequest:
 *       type: object
 *       required: [game_id, card_index]
 *       properties:
 *         game_id:
 *           type: integer
 *           example: 1
 *         card_index:
 *           type: integer
 *           example: 0
 *         chosen_color:
 *           type: string
 *           enum: [red, yellow, green, blue]
 *           description: Obrigatório quando a carta for wild ou wild_draw4.
 *           example: blue
 *     RealtimeCard:
 *       type: object
 *       properties:
 *         color:
 *           type: string
 *           example: red
 *         value:
 *           type: string
 *           example: 7
 *         chosenColor:
 *           type: string
 *           nullable: true
 *           example: blue
 *     RealtimePlayer:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: bruno_teste
 *         isReady:
 *           type: boolean
 *           example: true
 *         handCount:
 *           type: integer
 *           example: 6
 *         isCurrentTurn:
 *           type: boolean
 *           example: true
 *         mustDeclareUno:
 *           type: boolean
 *           example: false
 *         unoDeclared:
 *           type: boolean
 *           example: false
 *     RealtimeStateResponse:
 *       type: object
 *       properties:
 *         gameId:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Lobby Bruno
 *         status:
 *           type: string
 *           enum: [waiting, in_progress, finished]
 *           example: in_progress
 *         currentPlayerIndex:
 *           type: integer
 *           example: 0
 *         direction:
 *           type: integer
 *           example: 1
 *         topCard:
 *           $ref: '#/components/schemas/RealtimeCard'
 *         players:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RealtimePlayer'
 *         myHand:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RealtimeCard'
 *         mustDeclareUno:
 *           type: boolean
 *           example: false
 *         unoDeclared:
 *           type: boolean
 *           example: false
 *         winnerUserId:
 *           type: integer
 *           nullable: true
 *           example: null
 *
 * /health:
 *   get:
 *     summary: Verifica se a API está online
 *     tags: [Infra]
 *     responses:
 *       200:
 *         description: API disponível
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *
 * /openapi.json:
 *   get:
 *     summary: Retorna o schema OpenAPI em JSON
 *     tags: [Infra]
 *     responses:
 *       200:
 *         description: Schema OpenAPI gerado pelo swagger-jsdoc
 */

module.exports = {};
