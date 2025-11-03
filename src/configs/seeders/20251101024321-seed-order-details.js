import { QueryTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  console.log("Seeding order_details... using all available products...");

  try {
    // --- BƯỚC 1: LẤY TOÀN BỘ SẢN PHẨM ---
    const products = await queryInterface.sequelize.query(
      `SELECT product_id, product_name, price FROM "products"`,
      { type: QueryTypes.SELECT }
    );

    if (!products.length) {
      console.warn(
        "⚠️ Không tìm thấy sản phẩm nào. Bỏ qua seeding order_details."
      );
      return;
    }

    // --- BƯỚC 2: LẤY TOÀN BỘ ĐƠN HÀNG (trừ đơn đã hủy) ---
    const orders = await queryInterface.sequelize.query(
      `SELECT order_id, status FROM "orders" WHERE status != 'cancelled'`,
      { type: QueryTypes.SELECT }
    );

    if (!orders.length) {
      console.warn(
        "⚠️ Không tìm thấy đơn hàng nào. Bỏ qua seeding order_details."
      );
      return;
    }

    // --- BƯỚC 3: GHÉP DỮ LIỆU ---
    const orderDetailsData = [];

    for (const order of orders) {
      // Lấy ngẫu nhiên 1-3 sản phẩm cho mỗi đơn hàng
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [...products]
        .sort(() => 0.5 - Math.random())
        .slice(0, numProducts);

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1; // 1–3 sản phẩm

        orderDetailsData.push({
          order_id: order.order_id,
          product_id: product.product_id,
          quantity,
          unit_price: product.price,
        });
      }
    }

    // --- BƯỚC 4: GHI DỮ LIỆU ---
    await queryInterface.bulkInsert("order_details", orderDetailsData, {});
    console.log(
      `✅ Đã seed ${orderDetailsData.length} order_details cho ${orders.length} orders`
    );
  } catch (error) {
    console.error("❌ Lỗi khi seeding order_details:", error.message);
    console.error(
      "Vui lòng đảm bảo bạn đã seed 'users', 'products', và 'orders' trước."
    );
  }
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete("order_details", null, {});
  console.log("❌ Đã xóa toàn bộ dữ liệu trong bảng order_details");
};
