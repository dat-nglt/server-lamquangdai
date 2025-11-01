import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize"; // 👈 Cần import

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  console.log("Seeding cart... fetching user and product IDs...");

  try {
    // --- BƯỚC 1: LẤY USER IDs CỦA KHÁCH HÀNG ---
    const users = await queryInterface.sequelize.query(
      `SELECT user_id, full_name FROM "users" WHERE role = 'customer' AND phone IN ('0987654321', '0912345678')`,
      { type: QueryTypes.SELECT }
    );
    const userA = users.find((u) => u.full_name === "Nguyễn Văn A");
    const userB = users.find((u) => u.full_name === "Trần Thị B");

    if (!userA || !userB) {
      console.warn(
        "⚠️  Không tìm thấy 'customer' users. Bỏ qua seeding 'cart'."
      );
      return;
    }

    // --- BƯỚC 2: LẤY PRODUCT IDs ---
    const products = await queryInterface.sequelize.query(
      `SELECT product_id, product_name FROM "products" WHERE product_name IN (
        'iPhone 15 Pro Max 256GB',
        'Tai nghe Sony WH-1000XM5',
        'TV QLED Samsung 4K 65 inch'
      )`,
      { type: QueryTypes.SELECT }
    );

    // Tạo map để dễ tra cứu
    const productMap = products.reduce((acc, p) => {
      acc[p.product_name] = p.product_id;
      return acc;
    }, {});

    const iphoneId = productMap["iPhone 15 Pro Max 256GB"];
    const sonyId = productMap["Tai nghe Sony WH-1000XM5"];
    const samsungTvId = productMap["TV QLED Samsung 4K 65 inch"];

    if (!iphoneId || !sonyId || !samsungTvId) {
      console.warn(
        "⚠️  Không tìm thấy đủ products mẫu. Bỏ qua seeding 'cart'."
      );
      return;
    }

    // --- BƯỚC 3: TẠO DỮ LIỆU GIỎ HÀNG ---
    const cartData = [
      // Giỏ hàng của User A (Nguyễn Văn A)
      {
        cart_id: uuidv4(),
        user_id: userA.user_id, // 🔑
        product_id: iphoneId, // 🔑
        quantity: 1,
        added_at: new Date(),
      },
      // Giỏ hàng của User B (Trần Thị B)
      {
        cart_id: uuidv4(),
        user_id: userB.user_id, // 🔑
        product_id: sonyId, // 🔑
        quantity: 2, // Mua 2 cái
        added_at: new Date(new Date().setHours(new Date().getHours() - 1)), // Thêm 1 giờ trước
      },
      {
        cart_id: uuidv4(),
        user_id: userB.user_id, // 🔑
        product_id: samsungTvId, // 🔑
        quantity: 1,
        added_at: new Date(),
      },
    ];

    // --- BƯỚC 4: CHÈN DỮ LIỆU ---
    await queryInterface.bulkInsert("cart", cartData, {});
    console.log(`✅ Seeded ${cartData.length} items into cart`);
  } catch (error) {
    console.error("❌ Lỗi khi seeding 'cart':", error.message);
    console.error(
      "Vui lòng đảm bảo bạn đã chạy seeders 'users' và 'products' trước."
    );
  }
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'cart'
  await queryInterface.bulkDelete("cart", null, {});
  console.log("❌ Emptied cart table");
};
