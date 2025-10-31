"use strict";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("orders", {
    order_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users", // Tên bảng users
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // Ngăn xóa User nếu họ có Order
    },
    order_date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    total_price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      // validate: { min: 0 } là quy tắc ở tầng model
    },
    status: {
      type: Sequelize.ENUM(
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    delivery_address: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    // Không có createdAt/updatedAt vì model có 'timestamps: false'
  });

  // Ghi chú:
  // Cột `user_id` là một foreign key,
  // nên index sẽ thường được tự động tạo bởi CSDL.
  // Bạn có thể thêm index một cách tường minh nếu muốn:
  await queryInterface.addIndex("orders", ["user_id"]);
  await queryInterface.addIndex("orders", ["status"]); // Index cột status cũng là một ý hay
};

export const down = async (queryInterface, Sequelize) => {
  // Nếu bạn đã thêm index ở trên, hãy xóa chúng ở đây:
  await queryInterface.removeIndex("orders", ["user_id"]);
  await queryInterface.removeIndex("orders", ["status"]);

  await queryInterface.dropTable("orders");
};
