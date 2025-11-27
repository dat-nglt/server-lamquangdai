import { DataTypes } from "sequelize";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("api_keys", {
    api_key_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  // Thêm index cho model để dễ query
  await queryInterface.addIndex("api_keys", ["model"]);
  await queryInterface.addIndex("api_keys", ["is_active"]);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeIndex("api_keys", ["model"]);
  await queryInterface.removeIndex("api_keys", ["is_active"]);

  await queryInterface.dropTable("api_keys");
  console.log("❌ Dropped api_keys table");
};