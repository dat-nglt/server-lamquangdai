"use strict";

import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const now = new Date();

  // --- BƯỚC 1: LẤY BRAND_ID TỪ CSDL ---
  console.log("Seeding products... waiting for brand IDs...");
  let brandMap = {};
  try {
    const brands = await queryInterface.sequelize.query(
      `SELECT brand_id, brand_name FROM "brands" WHERE brand_name IN ('Apple', 'Samsung', 'Sony', 'Daikin')`,
      { type: QueryTypes.SELECT }
    );
    brands.forEach((brand) => {
      brandMap[brand.brand_name] = brand.brand_id;
    });
    // (Bỏ bớt log cho ngắn gọn)
  } catch (error) {
    console.error("❌ Lỗi khi truy vấn brand IDs:", error.message);
    return;
  }
  console.log("✅ Brand IDs fetched successfully.");

  // --- BƯỚC 2: LẤY CATEGORY_ID TỪ CSDL ---
  console.log("Seeding products... waiting for category IDs...");
  let categoryMap = {};
  const requiredCategories = [
    "Smartphones",
    "TVs",
    "Headphones",
    "Air Conditioners",
  ];
  try {
    const categories = await queryInterface.sequelize.query(
      `SELECT category_id, category_name FROM "categories" WHERE category_name IN (:categoryNames)`,
      {
        replacements: { categoryNames: requiredCategories },
        type: QueryTypes.SELECT,
      }
    );
    categories.forEach((cat) => {
      categoryMap[cat.category_name] = cat.category_id;
    });

    if (categories.length < requiredCategories.length) {
      console.warn(
        `⚠️ Cảnh báo: Chỉ tìm thấy ${categories.length}/${requiredCategories.length} categories.`
      );
    }
  } catch (error) {
    console.error("❌ Lỗi khi truy vấn category IDs:", error.message);
    return;
  }
  console.log("✅ Category IDs fetched successfully.");

  // --- BƯỚC 3: TẠO DỮ LIỆU SẢN PHẨM ---
  const productsData = [
    {
      product_id: uuidv4(),
      product_name: "iPhone 15 Pro Max 256GB",
      brand_id: brandMap["Apple"],
      category_id: categoryMap["Smartphones"],
      description: "Siêu phẩm iPhone mới nhất với chip A17 Pro và khung Titan.",
      price: 32990000.0,
      image_url: "https://picsum.photos/seed/iphone15/800/800",
      // --- SỬA LỖI: Thêm JSON.stringify() ---
      specifications: JSON.stringify({
        "Màn hình": "OLED 6.7 inch, 120Hz",
        Chip: "Apple A17 Pro",
        RAM: "8 GB",
        "Camera sau": "Chính 48MP, 2 Cảm biến phụ",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "TV QLED Samsung 4K 65 inch",
      brand_id: brandMap["Samsung"],
      category_id: categoryMap["TVs"],
      description: "Smart TV QLED với hình ảnh rực rỡ và âm thanh sống động.",
      price: 21500000.0,
      image_url: "https://picsum.photos/seed/samsungtv/800/800",
      // --- SỬA LỖI: Thêm JSON.stringify() ---
      specifications: JSON.stringify({
        "Loại TV": "QLED",
        "Kích thước": "65 inch",
        "Độ phân giải": "4K (3840 x 2160)",
        "Hệ điều hành": "Tizen OS",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Tai nghe Sony WH-1000XM5",
      brand_id: brandMap["Sony"],
      category_id: categoryMap["Headphones"],
      description: "Tai nghe chống ồn chủ động hàng đầu thị trường.",
      price: 8490000.0,
      image_url: "https://picsum.photos/seed/sonyxm5/800/800",
      // --- SỬA LỖI: Thêm JSON.stringify() ---
      specifications: JSON.stringify({
        "Loại tai nghe": "Chụp tai (Over-ear)",
        "Chống ồn": "Chủ động (ANC)",
        "Thời lượng pin": "30 giờ",
      }),
      status: "out_of_stock",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Máy lạnh Daikin Inverter 1.5 HP",
      brand_id: brandMap["Daikin"],
      category_id: categoryMap["Air Conditioners"],
      description: "Máy lạnh Inverter tiết kiệm điện, làm lạnh nhanh.",
      price: 13700000.0,
      image_url: "https://picsum.photos/seed/daikinac/800/800",
      // --- SỬA LỖI: Thêm JSON.stringify() ---
      specifications: JSON.stringify({
        "Công suất": "1.5 HP (~12.000 BTU)",
        "Loại máy": "Inverter",
        "Loại gas": "R32",
        "Diện tích phù hợp": "15 - 20 m²",
      }),
      status: "active",
      created_at: now,
    },
  ];

  // --- BƯỚC 4: CHÈN DỮ LIỆU ---
  const validProducts = productsData.filter((p) => p.brand_id && p.category_id);

  if (validProducts.length === 0 && productsData.length > 0) {
    console.error(
      "❌ Không thể chèn sản phẩm vì không tìm thấy brand_id hoặc category_id hợp lệ."
    );
    return;
  }

  if (validProducts.length < productsData.length) {
    console.warn(
      `⚠️ Chỉ chèn ${validProducts.length}/${productsData.length} sản phẩm do thiếu brand_id hoặc category_id.`
    );
  }

  // Chèn dữ liệu (giờ đã bao gồm JSON.stringify())
  await queryInterface.bulkInsert("products", validProducts, {});
  console.log(`✅ Seeded ${validProducts.length} products`);
};

// Hàm 'down' giữ nguyên
export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete("products", null, {});
  console.log("❌ Emptied products table");
};
