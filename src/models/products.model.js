import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const Products = sequelize.define(
    "Products",
    {
      product_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      },

      // --- TRƯỜNG MỚI ĐỂ LIÊN KẾT VỚI CATEGORY ---
      category_id: {
        type: DataTypes.UUID,
        allowNull: false, // Có thể đặt là true nếu sản phẩm không nhất thiết phải có danh mục
        references: {
          model: "categories", // Tham chiếu đến bảng 'categories'
          key: "category_id",
        },
      },
      // --- KẾT THÚC TRƯỜNG MỚI ---

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      specifications: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "out_of_stock"),
        defaultValue: "active",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "products",
      timestamps: false,
    }
  );

  Products.associate = (db) => {
    Products.belongsTo(db.Brands, { foreignKey: "brand_id" });

    // --- LIÊN KẾT MỚI VỚI CATEGORY ---
    // Một sản phẩm thuộc về một danh mục
    Products.belongsTo(db.Categories, { foreignKey: "category_id" });
    // --- KẾT THÚC LIÊN KẾT MỚI ---

    Products.hasMany(db.Cart, { foreignKey: "product_id" });
    Products.hasMany(db.OrderDetails, { foreignKey: "product_id" });
  };

  return Products;
};

export default init;
