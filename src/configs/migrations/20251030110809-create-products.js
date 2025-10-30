"use strict";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  await queryInterface.createTable("products", {
    product_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "brands",
        key: "brand_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // Không cho xóa brand nếu vẫn còn sản phẩm
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "out_of_stock"),
      allowNull: false,
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // 2. Thêm index
  // await queryInterface.addIndex("products", ["brand_id"]);
  // await queryInterface.addIndex("products", ["status"]);
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa index
  // await queryInterface.removeIndex("products", ["brand_id"]);
  // await queryInterface.removeIndex("products", ["status"]);

  // Xóa bảng
  await queryInterface.dropTable("products");

  // Nếu dùng PostgreSQL, nên xóa ENUM type để tránh lỗi khi migrate lại
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_products_status";'
  );
};
