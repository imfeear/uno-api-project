const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Game",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(120), allowNull: false },

      rules: { type: DataTypes.TEXT, allowNull: true },
      creatorId: { type: DataTypes.INTEGER, allowNull: true },

      status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: "waiting" },
      maxPlayers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 }
    },
    { tableName: "games", timestamps: true }
  );
