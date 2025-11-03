import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // Tạo 5 thương hiệu máy lạnh nổi tiếng
  const brandsData = [
    {
      brand_id: uuidv4(),
      brand_name: "Daikin",
      description:
        "Chuyên gia hàng đầu về giải pháp điều hòa không khí từ Nhật Bản.",
      logo_url: "https://picsum.photos/seed/daikin/200/200",
    },
    {
      brand_id: uuidv4(),
      brand_name: "Panasonic",
      description:
        "Thương hiệu Nhật Bản với công nghệ Nanoe™ X khử mùi, diệt khuẩn trên máy lạnh.",
      logo_url: "https://picsum.photos/seed/panasonic/200/200",
    },
    {
      brand_id: uuidv4(),
      brand_name: "LG",
      description:
        "Thương hiệu Hàn Quốc với dòng máy lạnh DUAL Inverter tiết kiệm điện.",
      logo_url: "https://picsum.photos/seed/lg/200/200",
    },
    {
      brand_id: uuidv4(),
      brand_name: "Samsung",
      description:
        "Tập đoàn Hàn Quốc nổi tiếng với các thiết bị gia dụng, bao gồm cả điều hòa không khí WindFree™.",
      logo_url: "https://picsum.photos/seed/samsung/200/200",
    },
    {
      brand_id: uuidv4(),
      brand_name: "Mitsubishi Electric",
      description:
        "Nổi tiếng với các dòng máy lạnh bền bỉ, tiết kiệm điện và vận hành êm ái.",
      logo_url: "https://picsum.photos/seed/mitsubishi/200/200",
    },
  ]; // Chèn dữ liệu vào bảng 'brands'

  await queryInterface.bulkInsert("brands", brandsData, {});
  console.log("✅ Seeded brands table with A/C brands");
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'brands'
  await queryInterface.bulkDelete("brands", null, {});
  console.log("❌ Emptied brands table");
};
