import { QueryTypes } from "sequelize"; // 👈 Cần import

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  console.log(
    "Seeding voucher_products... linking 'MAYLANH10' to 'Máy lạnh Daikin'..."
  );

  let voucherId;
  let productId;

  try {
    // --- BƯỚC 1: LẤY VOUCHER_ID ---
    const voucher = await queryInterface.sequelize.query(
      `SELECT voucher_id FROM "vouchers" WHERE code = 'MAYLANH10' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!voucher || voucher.length === 0) {
      console.warn(
        "⚠️  Không tìm thấy voucher 'MAYLANH10'. Bỏ qua seeding 'voucher_products'."
      );
      return;
    }
    voucherId = voucher[0].voucher_id;

    // --- BƯỚC 2: LẤY PRODUCT_ID ---
    const product = await queryInterface.sequelize.query(
      `SELECT product_id FROM "products" WHERE product_name = 'Máy lạnh Daikin Inverter 1.5 HP' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!product || product.length === 0) {
      console.warn(
        "⚠️  Không tìm thấy sản phẩm 'Máy lạnh Daikin Inverter 1.5 HP'. Bỏ qua seeding 'voucher_products'."
      );
      return;
    }
    productId = product[0].product_id;

    // --- BƯỚC 3: TẠO DỮ LIỆU LIÊN KẾT ---
    const voucherProductsData = [
      {
        voucher_id: voucherId,
        product_id: productId,
      },
      // Thêm các liên kết khác ở đây nếu muốn
      // { voucher_id: '...', product_id: '...' }
    ];

    // --- BƯỚC 4: CHÈN DỮ LIỆU ---
    await queryInterface.bulkInsert(
      "voucher_products",
      voucherProductsData,
      {}
    );
    console.log("✅ Seeded voucher_products table");
  } catch (error) {
    console.error("❌ Lỗi khi seeding 'voucher_products':", error.message);
    console.error(
      "Vui lòng đảm bảo bạn đã chạy seeders 'vouchers' và 'products' trước."
    );
  }
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'voucher_products'
  await queryInterface.bulkDelete("voucher_products", null, {});
  console.log("❌ Emptied voucher_products table");
};
