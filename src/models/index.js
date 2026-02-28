const { sequelize } = require("../config/database");

const Player = require("./Player")(sequelize);
const Game = require("./Game")(sequelize);
const Card = require("./Card")(sequelize);
const Score = require("./Score")(sequelize);

const User = require("./User")(sequelize);
const PlayerGame = require("./PlayerGame")(sequelize);

Game.hasMany(Card, { foreignKey: "gameId", as: "cards", onDelete: "CASCADE" });
Card.belongsTo(Game, { foreignKey: "gameId", as: "game" });

User.belongsToMany(Game, {
  through: PlayerGame,
  foreignKey: "userId",
  otherKey: "gameId",
  as: "games"
});
Game.belongsToMany(User, {
  through: PlayerGame,
  foreignKey: "gameId",
  otherKey: "userId",
  as: "users"
});

Game.hasMany(PlayerGame, { foreignKey: "gameId", as: "playerGames", onDelete: "CASCADE" });
User.hasMany(PlayerGame, { foreignKey: "userId", as: "playerGames", onDelete: "CASCADE" });
PlayerGame.belongsTo(Game, { foreignKey: "gameId", as: "game" });
PlayerGame.belongsTo(User, { foreignKey: "userId", as: "user" });

Player.hasMany(Score, { foreignKey: "playerId", as: "scores", onDelete: "CASCADE" });
Score.belongsTo(Player, { foreignKey: "playerId", as: "player" });

Game.hasMany(Score, { foreignKey: "gameId", as: "scores", onDelete: "CASCADE" });
Score.belongsTo(Game, { foreignKey: "gameId", as: "game" });

async function initDb() {
  await sequelize.authenticate();
  const alter = String(process.env.DB_SYNC_ALTER || "true").toLowerCase() === "true";
  await sequelize.sync({ alter });
}

module.exports = {
  sequelize,
  initDb,
  Player,
  Game,
  Card,
  Score,
  User,
  PlayerGame
};
