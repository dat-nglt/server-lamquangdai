"use strict";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  await queryInterface.createTable("promotions", {
    promo_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      // validate: { min: 0, max: 100 } — nằm ở tầng model
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  });

  // Thêm index cho các cột ngày để tối ưu truy vấn
  await queryInterface.addIndex("promotions", ["start_date", "end_date"]);
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa index
  await queryInterface.removeIndex("promotions", ["start_date", "end_date"]);

  // Xóa bảng
  await queryInterface.dropTable("promotions");
};
