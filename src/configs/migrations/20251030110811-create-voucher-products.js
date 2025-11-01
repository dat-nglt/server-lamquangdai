/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  await queryInterface.createTable("voucher_products", {
    voucher_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "vouchers", // Tên BẢNG
        key: "voucher_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE", // Xóa voucher -> xóa liên kết
    },
    product_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "products", // Tên BẢNG
        key: "product_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE", // Xóa sản phẩm -> xóa liên kết
    },
    // Bảng trung gian này không cần timestamps
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("voucher_products");
};
