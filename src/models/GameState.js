const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GameState = sequelize.define(
    "GameState",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      deck: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      discardPile: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      direction: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      currentPlayerIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      started: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      winnerUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      moveHistory: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: "GameStates",
      timestamps: false,
    }
  );

  return GameState;
};