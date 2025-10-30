"use strict";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  await queryInterface.createTable("users", {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true, // Tự động tạo unique index
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true, // Cho phép null
      // validate: { isEmail: true } — xử lý ở tầng model
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("customer", "admin"),
      allowNull: false,
      defaultValue: "customer",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Ghi chú:
  // - Cột "phone" có unique: true nên Sequelize tự động tạo unique index.
  // - Không cần timestamps vì model đã định nghĩa riêng 'created_at'.
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa bảng (tự động xóa unique index của 'phone')
  await queryInterface.dropTable("users");
};
