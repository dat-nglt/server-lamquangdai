"use strict";

import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // 1. Tạo bảng 'cart'
  await queryInterface.createTable("cart", {
    cart_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "products",
        key: "product_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // 2. Thêm index unique
  await queryInterface.addIndex("cart", ["user_id", "product_id"], {
    unique: true,
    name: "cart_user_product_unique_idx",
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeIndex("cart", "cart_user_product_unique_idx");
  await queryInterface.dropTable("cart");
};
