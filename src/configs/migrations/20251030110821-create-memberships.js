import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize"; // 👈 Cần import

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  console.log("Seeding memberships... fetching 'customer' user IDs...");

  let customerUsers = [];

  try {
    // --- BƯỚC 1: LẤY USER_ID CỦA KHÁCH HÀNG ---
    // Lấy user_id của 2 khách hàng 'Nguyễn Văn A' và 'Trần Thị B'
    // (Giả định họ đã được tạo từ seeder 'users')
    customerUsers = await queryInterface.sequelize.query(
      `SELECT user_id, full_name FROM "users" WHERE role = 'customer' AND phone IN ('0987654321', '0912345678')`,
      { type: QueryTypes.SELECT }
    );

    if (!customerUsers || customerUsers.length === 0) {
      console.warn(
        "⚠️  Không tìm thấy 'customer' users (Nguyễn Văn A, Trần Thị B). Bỏ qua seeding 'memberships'."
      );
      return;
    }
  } catch (error) {
    console.error("❌ Lỗi khi truy vấn 'users':", error.message);
    console.error("Vui lòng đảm bảo bạn đã chạy seeder 'users' trước.");
    return;
  }

  console.log(`✅ Fetched ${customerUsers.length} customer IDs.`);

  // --- BƯỚC 2: TẠO DỮ LIỆU MEMBERSHIPS ---
  const membershipsData = customerUsers.map((user, index) => {
    // Tạo dữ liệu khác nhau cho mỗi user
    const isSilver = index === 1; // Cho user thứ 2 làm "Silver"

    return {
      member_id: uuidv4(), // Phải tự tạo UUID
      user_id: user.user_id, // 🔑 ID đã lấy từ CSDL
      points: isSilver ? 1250 : 300,
      level: isSilver ? "silver" : "bronze", // 👈 Tùy chỉnh level
      updated_at: new Date(), // Phải tự tạo ngày
    };
  });

  // Ghi chú: User 'admin' sẽ không có thẻ thành viên trong ví dụ này.

  // --- BƯỚC 3: CHÈN DỮ LIỆU ---
  await queryInterface.bulkInsert("memberships", membershipsData, {});
  console.log(`✅ Seeded ${membershipsData.length} memberships`);
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'memberships'
  await queryInterface.bulkDelete("memberships", null, {});
  console.log("❌ Emptied memberships table");
};
