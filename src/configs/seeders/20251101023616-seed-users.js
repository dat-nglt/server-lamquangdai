"use strict";

import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // --- BƯỚC 1: BĂM MẬT KHẨU ---
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash("123456", salt);

  console.log("🔐 Seeding users... (Default password: 123456)");

  // --- BƯỚC 2: TẠO DỮ LIỆU NGƯỜI DÙNG ---
  const usersData = [
    {
      user_id: uuidv4(),
      zalo_id: null,
      full_name: "Admin User",
      phone: "0123456789",
      email: "admin@example.com",
      password: hashedPassword,
      address: "123 Admin Street, Ho Chi Minh City",
      avatar: null,
      gender: "male",
      date_of_birth: new Date("1990-01-01"),
      role: "admin",
      is_followed_oa: true,
      last_login: new Date(),
      login_method: "email",
      zalo_user_info: null,
      status: "active",
      email_verified: true,
      phone_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: uuidv4(),
      zalo_id: null,
      full_name: "Nguyễn Văn A",
      phone: "0987654321",
      email: "nguyenvana@example.com",
      password: hashedPassword,
      address: "456 Customer Avenue, Hanoi",
      avatar: null,
      gender: "male",
      date_of_birth: new Date("1995-06-15"),
      role: "customer",
      is_followed_oa: false,
      last_login: null,
      login_method: "email",
      zalo_user_info: null,
      status: "active",
      email_verified: true,
      phone_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: uuidv4(),
      zalo_id: null,
      full_name: "Trần Thị B",
      phone: "0912345678",
      email: "tranthib@example.com",
      password: hashedPassword,
      address: null,
      avatar: null,
      gender: "female",
      date_of_birth: new Date("1998-10-20"),
      role: "customer",
      is_followed_oa: false,
      last_login: null,
      login_method: "email",
      zalo_user_info: null,
      status: "active",
      email_verified: false,
      phone_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  // --- BƯỚC 3: CHÈN DỮ LIỆU ---
  await queryInterface.bulkInsert("users", usersData, {});
  console.log("✅ Users seeded successfully!");
};

/** Xoá dữ liệu (rollback) */
export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete("users", null, {});
  console.log("❌ Users table data removed!");
};
