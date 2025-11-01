// file: VoucherProducts.js
import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const VoucherProducts = sequelize.define(
    "VoucherProducts",
    {
      // Bảng này chỉ cần 2 khóa ngoại
      voucher_id: {
        type: DataTypes.UUID,
        primaryKey: true, // Làm khóa chính
        references: {
          model: "vouchers", // Tên BẢNG (tableName)
          key: "voucher_id",
        },
      },
      product_id: {
        type: DataTypes.UUID,
        primaryKey: true, // Làm khóa chính
        references: {
          model: "products", // Tên BẢNG (tableName)
          key: "product_id",
        },
      },
    },
    {
      tableName: "voucher_products", // Tên bảng trung gian
      timestamps: false,
    }
  );


  return VoucherProducts;
};

export default init;
