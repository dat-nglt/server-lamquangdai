import { DataTypes } from "sequelize";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("articles", {
    article_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // ✅ chuẩn Sequelize
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  });

  // ✅ Tạo index để tối ưu
  await queryInterface.addIndex("articles", ["created_at"]);
  await queryInterface.addIndex("articles", ["views"]);

};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeIndex("articles", ["created_at"]);
  await queryInterface.removeIndex("articles", ["views"]);
  await queryInterface.dropTable("articles");
  console.log("❌ Dropped articles table");
};
