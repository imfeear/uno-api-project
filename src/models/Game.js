const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Game = sequelize.define(
    "Game",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rules: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "waiting",
      },
      maxPlayers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      currentPlayerIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "Games",
      timestamps: false,
    }
  );

  return Game;
};