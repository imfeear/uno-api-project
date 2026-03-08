const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Card = sequelize.define(
    "Card",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "cards",
      timestamps: false,
    }
  );

  return Card;
};