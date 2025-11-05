import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // --- Cấu hình ngày ---
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // ms trong 1 ngày

  // 1. Promotion đã hết hạn (diễn ra 10 ngày trước, kết thúc hôm qua)
  const pastStartDate = new Date(now.getTime() - 10 * oneDay);
  const pastEndDate = new Date(now.getTime() - 1 * oneDay);

  // 2. Promotion đang diễn ra (bắt đầu 5 ngày trước, kết thúc 5 ngày nữa)
  const activeStartDate = new Date(now.getTime() - 5 * oneDay);
  const activeEndDate = new Date(now.getTime() + 5 * oneDay);

  // 3. Promotion sắp diễn ra (bắt đầu sau 10 ngày, kết thúc sau 20 ngày)
  const futureStartDate = new Date(now.getTime() + 10 * oneDay);
  const futureEndDate = new Date(now.getTime() + 20 * oneDay);

  // --- Dữ liệu mẫu ---
  const promotionsData = [
    {
      promo_id: uuidv4(), // Phải tự tạo UUID
      title: "Flash Sale Halloween (Đã kết thúc)",
      description: "Chương trình giảm giá Halloween đã kết thúc vào hôm qua.",
      discount_percent: 20.0,
      start_date: pastStartDate,
      end_date: pastEndDate,
      image_url: "https://picsum.photos/seed/halloween/1200/400",
    },
    {
      promo_id: uuidv4(),
      title: "Black Friday Sale (Đang diễn ra)",
      description: "Giảm giá 15% tất cả TV và Dàn âm thanh.",
      discount_percent: 15.5, // Thử số lẻ
      start_date: activeStartDate,
      end_date: activeEndDate,
      image_url: "https://picsum.photos/seed/blackfriday/1200/400",
    },
    {
      promo_id: uuidv4(),
      title: "Chào Giáng Sinh (Sắp diễn ra)",
      description: "Giảm giá sốc cho các mặt hàng máy lạnh và gia dụng.",
      discount_percent: 30.0,
      start_date: futureStartDate,
      end_date: futureEndDate,
      image_url: "https://picsum.photos/seed/christmas/1200/400",
    },
  ];

  // Chèn dữ liệu vào bảng 'promotions'
  await queryInterface.bulkInsert("promotions", promotionsData, {});
  console.log("✅ Seeded promotions table");
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'promotions'
  await queryInterface.bulkDelete("promotions", null, {});
  console.log("❌ Emptied promotions table");
};
