"use strict";

import { randomUUID } from "crypto";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // 1. Định nghĩa trước UUID cho các danh mục cha
  const electronicsId = randomUUID();
  const booksId = randomUUID();
  const clothingId = randomUUID();

  const now = new Date();

  await queryInterface.bulkInsert(
    "categories",
    [
      // --- CẤP 1: DANH MỤC CHA ---
      {
        category_id: electronicsId,
        category_name: "Electronics",
        description: "Các thiết bị điện tử, công nghệ và phụ kiện.",
        parent_id: null,
        status: "active",
        created_at: now,
      },
      {
        category_id: booksId,
        category_name: "Books",
        description: "Sách, tiểu thuyết, truyện tranh và sách giáo khoa.",
        parent_id: null,
        status: "active",
        created_at: now,
      },
      {
        category_id: clothingId,
        category_name: "Clothing",
        description: "Quần áo cho nam, nữ và trẻ em.",
        parent_id: null,
        status: "inactive",
        created_at: now,
      },

      // --- CẤP 2: DANH MỤC CON (Thuộc Electronics) ---
      {
        category_id: randomUUID(),
        category_name: "Laptops",
        description: "Máy tính xách tay và Ultrabooks.",
        parent_id: electronicsId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Smartphones",
        description: "Điện thoại thông minh và phụ kiện.",
        parent_id: electronicsId,
        status: "active",
        created_at: now,
      },

      // --- CÁC DANH MỤC ĐƯỢC BỔ SUNG ĐỂ SỬA LỖI ---
      {
        category_id: randomUUID(),
        category_name: "TVs", // 👈 Bổ sung
        description: "Tivi, Smart TV và phụ kiện.",
        parent_id: electronicsId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Headphones", // 👈 Bổ sung
        description: "Tai nghe có dây, không dây và chống ồn.",
        parent_id: electronicsId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Air Conditioners", // 👈 Bổ sung
        description: "Máy lạnh, điều hòa không khí.",
        parent_id: electronicsId,
        status: "active",
        created_at: now,
      },
      // --- KẾT THÚC BỔ SUNG ---

      // --- CẤP 2: DANH MỤC CON (Thuộc Books) ---
      {
        category_id: randomUUID(),
        category_name: "Fiction",
        description: "Tiểu thuyết và truyện hư cấu.",
        parent_id: booksId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Science",
        description: "Sách về khoa học và tự nhiên.",
        parent_id: booksId,
        status: "active",
        created_at: now,
      },
    ],
    {}
  );
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa tất cả dữ liệu khỏi bảng 'categories'
  await queryInterface.bulkDelete("categories", null, {});
};
