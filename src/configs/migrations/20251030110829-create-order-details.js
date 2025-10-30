"use strict";

import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("order_details", {
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "orders",
        key: "order_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "products",
        key: "product_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  });

  // ✅ Không cần addIndex riêng — composite PK tự tạo unique index.
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("order_details");
};
