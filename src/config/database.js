const { Sequelize } = require("sequelize");

function toBool(v) {
  return String(v).toLowerCase() === "true";
}

const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT || 5432);
const database = process.env.DB_NAME || "uno_api_js";
const username = process.env.DB_USER || "postgres";
const password = process.env.DB_PASS || "postgres";
const ssl = toBool(process.env.DB_SSL || "false");

const sequelize = new Sequelize(database, username, password, {
  dialect: "postgres",
  host,
  port,
  logging: false,
  dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {}
});

module.exports = { sequelize };
