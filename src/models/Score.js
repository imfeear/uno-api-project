const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Score = sequelize.define(
    "Score",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "scores",
      timestamps: false,
    }
  );

  return Score;
};