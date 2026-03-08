const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "UNO API",
      version: "1.1.0",
      description: "Projeto Final Programação 04 - API UNO",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
      {
        url: "http://localhost:3000/api",
        description: "Base da API",
      },
    ],
    tags: [
      { name: "Auth", description: "Autenticação de usuários" },
      { name: "Users", description: "Gerenciamento de usuários" },
      { name: "Games", description: "Gerenciamento de partidas" },
      { name: "Players", description: "Gerenciamento de jogadores" },
      { name: "Cards", description: "Gerenciamento de cartas" },
      { name: "Scores", description: "Gerenciamento de pontuações" },
      { name: "Realtime Game", description: "Fluxo em tempo real do jogo" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Mensagem de erro",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "bruno@email.com",
            },
            password: {
              type: "string",
              example: "123456",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "jwt.token.aqui",
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/*.js",
    "./src/controllers/**/*.js",
    "./src/docs/*.js",
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;