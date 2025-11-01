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

    category_id: {
      type: DataTypes.UUID,
      allowNull: false, // Giả sử 1 sản phẩm bắt buộc phải có danh mục
      references: {
        model: "categories", // Tham chiếu đến bảng 'categories'
        key: "category_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // Không cho xóa category nếu vẫn còn sản phẩm
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
    specifications: {
      type: DataTypes.JSONB, // Dùng JSONB cho PostgreSQL sẽ tốt hơn JSON
      allowNull: true,
      defaultValue: {},
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

  // Thêm index
  // await queryInterface.addIndex("products", ["brand_id"]);
  await queryInterface.addIndex("products", ["category_id"]); // Index cho khóa ngoại mới
  // await queryInterface.addIndex("products", ["status"]);
  await queryInterface.addIndex("products", ["price"]); // Thường xuyên lọc/sắp xếp theo giá
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa index
  // await queryInterface.removeIndex("products", ["brand_id"]);
  await queryInterface.removeIndex("products", ["category_id"]);
  // await queryInterface.removeIndex("products", ["status"]);
  await queryInterface.removeIndex("products", ["price"]);

  // Xóa bảng
  await queryInterface.dropTable("products");

  // Nếu dùng PostgreSQL, nên xóa ENUM type để tránh lỗi khi migrate lại
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_products_status";'
  );
};
