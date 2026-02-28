const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      email: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false }
    },
    { tableName: "users", timestamps: true }
  );
