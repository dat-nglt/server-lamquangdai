import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize"; // 👈 Cần import

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  console.log("Seeding orders... fetching 'customer' user IDs...");

  let customerUsers = [];

  try {
    // --- BƯỚC 1: LẤY USER_ID VÀ ĐỊA CHỈ CỦA KHÁCH HÀNG ---
    // (Giả định họ đã được tạo từ seeder 'users')
    customerUsers = await queryInterface.sequelize.query(
      `SELECT user_id, full_name, address FROM "users" WHERE role = 'customer'`,
      { type: QueryTypes.SELECT }
    );

    if (!customerUsers || customerUsers.length < 2) {
      console.warn(
        "⚠️  Không tìm thấy đủ 'customer' users. Bỏ qua seeding 'orders'."
      );
      return;
    }
  } catch (error) {
    console.error("❌ Lỗi khi truy vấn 'users':", error.message);
    console.error("Vui lòng đảm bảo bạn đã chạy seeder 'users' trước.");
    return;
  }

  console.log(`✅ Fetched ${customerUsers.length} customer users.`);

  // Lấy 2 user mẫu
  const userA = customerUsers.find((u) => u.full_name === "Nguyễn Văn A");
  const userB = customerUsers.find((u) => u.full_name === "Trần Thị B");

  // Kiểm tra lại user (đề phòng)
  if (!userA || !userB) {
    console.warn("⚠️  Không tìm thấy 'Nguyễn Văn A' hoặc 'Trần Thị B'.");
    return;
  }

  // --- BƯỚC 2: TẠO DỮ LIỆU ĐƠN HÀNG ---
  const ordersData = [
    // 1. Đơn hàng "Đang giao" cho User A (dùng địa chỉ mặc định của userA)
    {
      order_id: uuidv4(),
      user_id: userA.user_id, // 🔑
      order_date: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 ngày trước
      total_price: 32990000.0, // (Giả vờ mua iPhone 15)
      status: "shipping",
      delivery_address: userA.address, // "456 Customer Avenue, Hanoi"
    },

    // 2. Đơn hàng "Đã giao" cho User B
    // (User B không có địa chỉ, nhưng 'delivery_address' là 'allowNull: false'
    // nên chúng ta PHẢI cung cấp một địa chỉ)
    {
      order_id: uuidv4(),
      user_id: userB.user_id, // 🔑
      order_date: new Date(new Date().setDate(new Date().getDate() - 7)), // 1 tuần trước
      total_price: 8490000.0, // (Giả vờ mua Tai nghe Sony)
      status: "delivered",
      delivery_address: "789 Lê Duẩn, Quận 1, TP. Hồ Chí Minh", // 👈 Địa chỉ mới
    },

    // 3. Đơn hàng "Đã hủy" cho User A
    {
      order_id: uuidv4(),
      user_id: userA.user_id, // 🔑
      order_date: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 ngày trước
      total_price: 150000.0,
      status: "cancelled",
      delivery_address: userA.address, // Dùng lại địa chỉ mặc định
    },

    // 4. Đơn hàng "Chờ xác nhận" cho User B
    {
      order_id: uuidv4(),
      user_id: userB.user_id, // 🔑
      order_date: new Date(), // Mới đặt hôm nay
      total_price: 13700000.0, // (Giả vờ mua Máy lạnh Daikin)
      status: "pending",
      delivery_address: "100 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", // 👈 Địa chỉ khác
    },
  ];

  // --- BƯỚC 3: CHÈN DỮ LIỆU ---
  await queryInterface.bulkInsert("orders", ordersData, {});
  console.log(`✅ Seeded ${ordersData.length} orders`);
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'orders'
  await queryInterface.bulkDelete("orders", null, {});
  console.log("❌ Emptied orders table");
};
