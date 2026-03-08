const { Sequelize } = require("sequelize");
require("dotenv").config();

function toBool(v) {
  return String(v).toLowerCase() === "true";
}

const dbName = process.env.DB_NAME || "uno_api_js";
const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD ?? process.env.DB_PASS ?? "postgres";
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 5432);
const dbSsl = toBool(process.env.DB_SSL || "false");
const dbSyncAlter = toBool(process.env.DB_SYNC_ALTER || "false");

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  logging: false,
  dialectOptions: dbSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

const User = require("./User")(sequelize);
const Game = require("./Game")(sequelize);
const PlayerGame = require("./PlayerGame")(sequelize);
const Player = require("./Player")(sequelize);
const Card = require("./Card")(sequelize);
const Score = require("./Score")(sequelize);
const GameState = require("./GameState")(sequelize);
const PlayerHand = require("./PlayerHand")(sequelize);

/* Realtime / lobby */

User.hasMany(PlayerGame, {
  foreignKey: "userId",
  as: "playerGames",
});

PlayerGame.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Game.hasMany(PlayerGame, {
  foreignKey: "gameId",
  as: "playerGames",
});

PlayerGame.belongsTo(Game, {
  foreignKey: "gameId",
  as: "game",
});

User.belongsToMany(Game, {
  through: PlayerGame,
  foreignKey: "userId",
  otherKey: "gameId",
  as: "games",
});

Game.belongsToMany(User, {
  through: PlayerGame,
  foreignKey: "gameId",
  otherKey: "userId",
  as: "users",
});

Game.hasMany(Card, {
  foreignKey: "gameId",
  as: "cards",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Card.belongsTo(Game, {
  foreignKey: "gameId",
  as: "game",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Player.hasMany(Score, {
  foreignKey: "playerId",
  as: "scores",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Score.belongsTo(Player, {
  foreignKey: "playerId",
  as: "player",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Game.hasMany(Score, {
  foreignKey: "gameId",
  as: "scores",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Score.belongsTo(Game, {
  foreignKey: "gameId",
  as: "game",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Game.hasOne(GameState, {
  foreignKey: "gameId",
  as: "state",
});

GameState.belongsTo(Game, {
  foreignKey: "gameId",
  as: "game",
});

Game.hasMany(PlayerHand, {
  foreignKey: "gameId",
  as: "hands",
});

PlayerHand.belongsTo(Game, {
  foreignKey: "gameId",
  as: "game",
});

User.hasMany(PlayerHand, {
  foreignKey: "userId",
  as: "hands",
});

PlayerHand.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

async function initDb() {
  await sequelize.authenticate();
  console.log("Database connected successfully.");

  await sequelize.sync({ alter: true });
  console.log("Database synchronized.");
}

module.exports = {
  sequelize,
  Sequelize,
  initDb,
  User,
  Game,
  GameState,
  PlayerHand,
  PlayerGame,
  Player,
  Card,
  Score,
};