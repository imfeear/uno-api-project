const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Player",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      age: { type: DataTypes.INTEGER, allowNull: false },
      email: { type: DataTypes.STRING(160), allowNull: false, unique: true }
    },
    { tableName: "players", timestamps: true }
  );
