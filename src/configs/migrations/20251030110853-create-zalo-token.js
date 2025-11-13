// migrations/xxxx-create-zalo-tokens.js
"use strict";

/** @type {import('sequelize').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("zalo_tokens", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    access_token: {
      type: Sequelize.TEXT, // Dùng TEXT cho token dài
      allowNull: false,
    },
    refresh_token: {
      type: Sequelize.TEXT, // Dùng TEXT cho token dài
      allowNull: false,
    },
    access_token_expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    refresh_token_expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("zalo_tokens");
};
