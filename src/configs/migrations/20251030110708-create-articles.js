import { DataTypes } from "sequelize";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("articles", {
    article_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    excerpt: {
      // Thêm mới
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      // Đổi tên và kiểu
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      // Thêm mới
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    published_at: {
      // Thêm mới
      type: DataTypes.DATE,
      allowNull: true,
    },
    read_time: {
      // Thêm mới
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    featured: {
      // Thêm mới
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // Thêm created_at và updated_at (do model có timestamps: true)
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

  // Cập nhật index cho các cột mới dùng để lọc/sắp xếp
  await queryInterface.addIndex("articles", ["published_at"]);
  await queryInterface.addIndex("articles", ["category"]);
  await queryInterface.addIndex("articles", ["featured"]);
  await queryInterface.addIndex("articles", ["views"]);
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa các index đã thêm
  await queryInterface.removeIndex("articles", ["published_at"]);
  await queryInterface.removeIndex("articles", ["category"]);
  await queryInterface.removeIndex("articles", ["featured"]);
  await queryInterface.removeIndex("articles", ["views"]);

  await queryInterface.dropTable("articles");
  console.log("❌ Dropped articles table");
};
