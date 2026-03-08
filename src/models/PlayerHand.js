const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PlayerHand = sequelize.define(
    "PlayerHand",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cards: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      mustDeclareUno: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      unoDeclared: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "PlayerHands",
      timestamps: false,
    }
  );

  return PlayerHand;
};