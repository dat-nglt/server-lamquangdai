import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // Tạo 4 thương hiệu mẫu
  const brandsData = [
    {
      brand_id: uuidv4(), // Phải tự tạo UUID
      brand_name: "Apple",
      description: "Thương hiệu công nghệ hàng đầu với iPhone, MacBook và iPad.",
      logo_url: "https://picsum.photos/seed/apple/200/200",
    },
    {
      brand_id: uuidv4(),
      brand_name: "Samsung",
      description:
        "Tập đoàn đa quốc gia từ Hàn Quốc, nổi tiếng với điện thoại Galaxy và TV.",
      logo_url: "https://picsum.photos/seed/samsung/200/200",
    },
    {
      brand_id: uuidv4(),
      brand_name: "Sony",
      description:
        "Thương hiệu Nhật Bản nổi tiếng với TV Bravia, máy chơi game PlayStation và tai nghe.",
      logo_url: "https://picsum.photos/seed/sony/200/200",
    },
    {
      brand_id: uuidv4(),
      brand_name: "Daikin",
      description:
        "Chuyên gia hàng đầu về giải pháp điều hòa không khí từ Nhật Bản.",
      logo_url: "https://picsum.photos/seed/daikin/200/200",
    },
  ];

  // Chèn dữ liệu vào bảng 'brands'
  await queryInterface.bulkInsert("brands", brandsData, {});
  console.log("✅ Seeded brands table");
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'brands'
  await queryInterface.bulkDelete("brands", null, {});
  console.log("❌ Emptied brands table");
};