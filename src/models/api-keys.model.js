import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const ApiKeys = sequelize.define(
    "ApiKeys",
    {
      api_key_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      api_key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "api_keys",
      timestamps: true,
      underscored: true,
    }
  );

  return ApiKeys;
};

export default init;