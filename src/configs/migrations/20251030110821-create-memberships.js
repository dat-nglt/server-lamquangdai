"use strict";

import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // 1. Tạo bảng 'memberships'
  await queryInterface.createTable("memberships", {
    member_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Mỗi user chỉ có 1 membership
      references: {
        model: "users",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.ENUM("bronze", "silver", "gold", "platinum"),
      allowNull: false,
      defaultValue: "bronze",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // ✅ Sequelize sẽ tự tạo index unique cho user_id
};

export const down = async (queryInterface, Sequelize) => {
  // Cần drop ENUM type (Postgres yêu cầu, MySQL thì tự xử lý)
  await queryInterface.dropTable("memberships");
  await queryInterface.sequelize.query(
    `DROP TYPE IF EXISTS "enum_memberships_level";`
  );
};
