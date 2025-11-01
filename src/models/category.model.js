import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const Categories = sequelize.define(
    "Categories",
    {
      category_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      category_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // Tên danh mục nên là duy nhất
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      parent_id: {
        // Dùng để tạo danh mục cha-con
        type: DataTypes.UUID,
        allowNull: true, // Top-level categories sẽ có parent_id là NULL
        references: {
          model: "categories", // Tự tham chiếu đến chính nó
          key: "category_id",
        },
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "categories",
      timestamps: false,
    }
  );

  Categories.associate = (db) => {
    // Một danh mục có thể có nhiều sản phẩm
    Categories.hasMany(db.Products, { foreignKey: "category_id" });

    // Quan hệ tự tham chiếu để lấy danh mục con
    Categories.hasMany(db.Categories, {
      foreignKey: "parent_id",
      as: "Subcategories",
    });

    // Quan hệ tự tham chiếu để lấy danh mục cha
    Categories.belongsTo(db.Categories, {
      foreignKey: "parent_id",
      as: "ParentCategory",
    });
  };

  return Categories;
};

export default init;
