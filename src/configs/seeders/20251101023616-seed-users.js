import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs"; // 👈 Cần import bcryptjs

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // --- BƯỚC 1: BĂM MẬT KHẨU ---
  // Chúng ta sẽ dùng chung một mật khẩu "123456" cho tất cả user mẫu
  // Bạn phải băm mật khẩu này trước khi chèn vào CSDL
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash("123456", salt);

  console.log("Seeding users... (Default password for all: 123456)");

  // --- BƯỚC 2: TẠO DỮ LIỆU ---
  const usersData = [
    // 1. Admin User
    {
      user_id: uuidv4(), // Phải tự tạo UUID
      full_name: "Admin User",
      phone: "0123456789", // Phải là unique
      email: "admin@example.com",
      password: hashedPassword, // 👈 Dùng mật khẩu đã băm
      address: "123 Admin Street, Ho Chi Minh City",
      role: "admin", // 👈 Role Admin
      created_at: new Date(), // Phải tự tạo ngày
    },

    // 2. Customer User 1
    {
      user_id: uuidv4(),
      full_name: "Nguyễn Văn A",
      phone: "0987654321", // Phải là unique
      email: "nguyenvana@example.com",
      password: hashedPassword, // 👈 Dùng mật khẩu đã băm
      address: "456 Customer Avenue, Hanoi",
      role: "customer", // 👈 Role Customer (mặc định)
      created_at: new Date(),
    },

    // 3. Customer User 2 (không có địa chỉ)
    {
      user_id: uuidv4(),
      full_name: "Trần Thị B",
      phone: "0912345678", // Phải là unique
      email: "tranthib@example.com",
      password: hashedPassword, // 👈 Dùng mật khẩu đã băm
      address: null, // 👈 Thử giá trị null
      role: "customer",
      created_at: new Date(),
    },
  ];

  // --- BƯỚC 3: CHÈN DỮ LIỆU ---
  await queryInterface.bulkInsert("users", usersData, {});
  console.log("✅ Seeded users table");
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'users'
  await queryInterface.bulkDelete("users", null, {});
  console.log("❌ Emptied users table");
};
