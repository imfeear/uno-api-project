const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PlayerGame = sequelize.define(
    "PlayerGame",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isReady: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "PlayerGames",
      timestamps: false,
    }
  );

  return PlayerGame;
};