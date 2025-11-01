"use strict";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  await queryInterface.createTable("categories", {
    category_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, // Tên danh mục không nên trùng
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parent_id: {
      // Dùng để tạo danh mục cha-con (nested)
      type: DataTypes.UUID,
      allowNull: true, // Danh mục gốc (root) sẽ có parent_id = NULL
      references: {
        model: "categories", // Tự tham chiếu đến chính nó
        key: "category_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Nếu xóa danh mục cha, các mục con sẽ trở thành mục gốc
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Thêm index để tăng tốc độ truy vấn
  await queryInterface.addIndex("categories", ["parent_id"]);
  await queryInterface.addIndex("categories", ["status"]);
  // Index unique đã được thêm trực tiếp trong 'category_name'
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa index
  await queryInterface.removeIndex("categories", ["parent_id"]);
  await queryInterface.removeIndex("categories", ["status"]);

  // Xóa bảng
  await queryInterface.dropTable("categories");

  // Nếu dùng PostgreSQL, nên xóa ENUM type
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_categories_status";'
  );
};
