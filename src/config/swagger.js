const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "UNO API",
      version: "1.0.0",
      description: "Projeto Final Programação 04 - API UNO",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/**/*.js"],
};

const specs = swaggerJsdoc(options);
module.exports = specs;