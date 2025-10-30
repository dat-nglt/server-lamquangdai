import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid"; // ✅ dùng để sinh UUID khi bulkInsert

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("brands", {
    brand_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // ✅ Sequelize tự sinh UUID nếu không có giá trị
      primaryKey: true,
      allowNull: false,
    },
    brand_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  });

  // ✅ Thêm index cho tên thương hiệu
  await queryInterface.addIndex("brands", ["brand_name"]);

};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeIndex("brands", ["brand_name"]);
  await queryInterface.dropTable("brands");
  console.log("❌ Dropped brands table");
};
