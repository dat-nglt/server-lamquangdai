"use strict";

import { randomUUID } from "crypto";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // 1. Định nghĩa trước UUID cho các danh mục cha
  const residentialId = randomUUID(); // Điều hòa dân dụng
  const commercialId = randomUUID(); // Điều hòa thương mại
  const suppliesId = randomUUID(); // Vật tư, phụ kiện

  const now = new Date();

  await queryInterface.bulkInsert(
    "categories",
    [
      // --- CẤP 1: DANH MỤC CHA ---
      {
        category_id: residentialId,
        category_name: "Điều Hoà Dân Dụng",
        description:
          "Các loại máy lạnh và giải pháp điều hòa cho gia đình, căn hộ.",
        parent_id: null,
        status: "active",
        created_at: now,
      },
      {
        category_id: commercialId,
        category_name: "Điều Hoà Thương Mại & Hệ Thống",
        description:
          "Giải pháp điều hòa công suất lớn cho văn phòng, tòa nhà, nhà xưởng.",
        parent_id: null,
        status: "active",
        created_at: now,
      },
      {
        category_id: suppliesId,
        category_name: "Vật Tư & Phụ Kiện Lạnh",
        description: "Ống đồng, ga lạnh, bảo ôn và các vật tư lắp đặt.",
        parent_id: null,
        status: "active",
        created_at: now,
      }, // --- CẤP 2: CON CỦA 'Điều Hoà Dân Dụng' ---

      {
        category_id: randomUUID(),
        category_name: "Máy Lạnh Treo Tường",
        description:
          "Dòng máy lạnh 1-1 phổ biến nhất cho phòng ngủ, phòng khách.",
        parent_id: residentialId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Máy Lạnh Multi",
        description:
          "Hệ thống 1 dàn nóng kết nối nhiều dàn lạnh, tiết kiệm không gian.",
        parent_id: residentialId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Máy Lạnh Tủ Đứng",
        description:
          "Máy lạnh dạng tủ, công suất lớn cho phòng khách rộng, sảnh.",
        parent_id: residentialId,
        status: "active",
        created_at: now,
      }, // --- CẤP 2: CON CỦA 'Điều Hoà Thương Mại & Hệ Thống' ---

      {
        category_id: randomUUID(),
        category_name: "Máy Lạnh Âm Trần (Cassette)",
        description:
          "Dàn lạnh lắp chìm vào trần, tỏa gió 4 hướng, thẩm mỹ cao.",
        parent_id: commercialId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Máy Lạnh Giấu Trần Nối Ống Gió",
        description:
          "Dàn lạnh hoàn toàn giấu trong trần, phân phối gió qua hệ thống ống gió.",
        parent_id: commercialId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Hệ Thống VRV / VRF",
        description:
          "Hệ thống điều hòa trung tâm công suất lớn, hiệu suất cao cho tòa nhà.",
        parent_id: commercialId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Máy Lạnh Áp Trần",
        description:
          "Dàn lạnh gắn áp sát trần nhà, luồng gió mạnh, phù hợp cho sảnh, cửa hàng.",
        parent_id: commercialId,
        status: "active",
        created_at: now,
      }, // --- CẤP 2: CON CỦA 'Vật Tư & Phụ Kiện' ---

      {
        category_id: randomUUID(),
        category_name: "Ống Đồng & Bảo Ôn",
        description:
          "Ống đồng, bảo ôn cách nhiệt, băng quấn cho đường ống gas.",
        parent_id: suppliesId,
        status: "active",
        created_at: now,
      },
      {
        category_id: randomUUID(),
        category_name: "Ga Lạnh",
        description: "Các loại ga R32, R410A, R22...",
        parent_id: suppliesId,
        status: "active",
        created_at: now,
      },
    ],
    {}
  );
  console.log("✅ Seeded categories table with A/C categories");
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa tất cả dữ liệu khỏi bảng 'categories'
  await queryInterface.bulkDelete("categories", null, {});
  console.log("❌ Emptied categories table");
};
