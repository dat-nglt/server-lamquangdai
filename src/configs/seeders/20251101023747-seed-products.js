"use strict";

import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const now = new Date(); // --- BƯỚC 1: LẤY BRAND_ID TỪ CSDL ---

  console.log("Seeding products... waiting for A/C brand IDs...");
  let brandMap = {};
  const requiredBrands = [
    "Daikin",
    "Panasonic",
    "LG",
    "Samsung",
    "Mitsubishi Electric",
  ];
  try {
    const brands = await queryInterface.sequelize.query(
      `SELECT brand_id, brand_name FROM "brands" WHERE brand_name IN (:brandNames)`,
      {
        replacements: { brandNames: requiredBrands },
        type: QueryTypes.SELECT,
      }
    );
    brands.forEach((brand) => {
      brandMap[brand.brand_name] = brand.brand_id;
    });
  } catch (error) {
    console.error("❌ Lỗi khi truy vấn brand IDs:", error.message);
    return;
  }
  console.log("✅ A/C Brand IDs fetched successfully."); // --- BƯỚC 2: LẤY CATEGORY_ID TỪ CSDL ---

  console.log("Seeding products... waiting for A/C category IDs...");
  let categoryMap = {};
  const requiredCategories = [
    "Máy Lạnh Treo Tường",
    "Máy Lạnh Âm Trần (Cassette)",
    "Máy Lạnh Tủ Đứng",
    "Máy Lạnh Multi",
    "Hệ Thống VRV / VRF",
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
  } catch (error) {
    console.error("❌ Lỗi khi truy vấn category IDs:", error.message);
    return;
  }
  console.log("✅ A/C Category IDs fetched successfully."); // --- BƯỚC 3: TẠO DỮ LIỆU SẢN PHẨM (20 SẢN PHẨM) ---

  const productsData = [
    // --- Daikin (4 products) ---
    {
      product_id: uuidv4(),
      product_name: "Daikin Inverter 1.0 HP FTKB25YVMV",
      brand_id: brandMap["Daikin"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description:
        "Tiết kiệm điện vượt trội với công nghệ Inverter và môi chất lạnh R32.",
      price: 9550000.0,
      image_url:
        "https://dienmayphucngocanh.com/wp-content/uploads/2024/07/dieu-hoa-treo-tuong-Daikin-FTKB25YVMV-1.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.0 HP (~9.200 BTU)",
        "Loại máy": "Inverter",
        "Loại gas": "R32",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Daikin Inverter 1.5 HP FTKB35YVMV",
      brand_id: brandMap["Daikin"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description: "Dòng máy lạnh Inverter 1.5 HP phù hợp cho phòng 15-20m².",
      price: 12100000.0,
      image_url:
        "https://product.hstatic.net/200000857195/product/may-lanh-daikin-ftkb35yvmv_6e4d771c218d4219b69c1942b193f596_1024x1024.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.5 HP (~12.000 BTU)",
        "Loại máy": "Inverter",
        "Loại gas": "R32",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Daikin Âm trần Cassette 18.000 BTU FCF50CVM",
      brand_id: brandMap["Daikin"],
      category_id: categoryMap["Máy Lạnh Âm Trần (Cassette)"],
      description: "Giải pháp làm lạnh 4 hướng thổi cho văn phòng, cửa hàng.",
      price: 26800000.0,
      image_url:
        "https://maylanhgiasi.com/wp-content/uploads/2019/01/Daikin-FCQ50KAVEA.jpg",
      specifications: JSON.stringify({
        "Công suất": "2.0 HP (~18.000 BTU)",
        "Loại máy": "Inverter",
        "Loại dàn lạnh": "Âm trần Cassette",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Dàn nóng Multi S Daikin 21.500 BTU MKM52AVMV",
      brand_id: brandMap["Daikin"],
      category_id: categoryMap["Máy Lạnh Multi"],
      description:
        "Dàn nóng Multi S kết nối tối đa 3 dàn lạnh, tiết kiệm diện tích ban công.",
      price: 23450000.0,
      image_url:
        "https://daikinvietnam.co/wp-content/uploads/2021/07/MKC70SVMV.jpg",
      specifications: JSON.stringify({
        "Công suất": "~2.5 HP (21.500 BTU)",
        "Loại máy": "Inverter",
        "Kết nối": "Tối đa 3 dàn lạnh",
      }),
      status: "active",
      created_at: now,
    }, // --- Panasonic (4 products) ---

    {
      product_id: uuidv4(),
      product_name: "Panasonic Inverter 1.0 HP CU/CS-XU9ZKH-8",
      brand_id: brandMap["Panasonic"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description: "Công nghệ Nanoe™ X thế hệ 3 diệt khuẩn, khử mùi hiệu quả.",
      price: 11790000.0,
      image_url:
        "https://dienmaysaigon.com/wp-content/uploads/2023/05/RE_0001_may-lanh-panasonic-CUCS-XU9ZKH-8-1.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.0 HP (~9.040 BTU)",
        "Công nghệ": "Nanoe™ X Gen 3, Inverter",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Panasonic Inverter 1.5 HP CU/CS-XU12ZKH-8",
      brand_id: brandMap["Panasonic"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description:
        "Dòng cao cấp AERO Series với cánh đảo gió kép, làm lạnh nhanh.",
      price: 14290000.0,
      image_url:
        "https://dienmaysaigon.com/wp-content/uploads/2023/05/RE_0001_may-lanh-panasonic-CUCS-XU12ZKH-8-1.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.5 HP (~12.000 BTU)",
        "Công nghệ": "Nanoe™ X, Inverter",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Panasonic Âm trần 24.000 BTU S-24PU3H",
      brand_id: brandMap["Panasonic"],
      category_id: categoryMap["Máy Lạnh Âm Trần (Cassette)"],
      description: "Máy lạnh âm trần 4 hướng thổi, tích hợp Nanoe™ X.",
      price: 31500000.0,
      image_url:
        "https://sieuthimaylanh.com/uploads/product/02_2023/dan-lanh-am-tran-multi-panasonic-inverter-3-0hp-cs-mz60wb4h8a.webp",
      specifications: JSON.stringify({
        "Công suất": "2.5 HP (~24.000 BTU)",
        "Loại máy": "Inverter",
        "Công nghệ": "Nanoe™ X",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Panasonic Tủ đứng 2.5 HP CU/CS-E24NFQ",
      brand_id: brandMap["Panasonic"],
      category_id: categoryMap["Máy Lạnh Tủ Đứng"],
      description: "Làm lạnh nhanh, luồng gió thổi xa, phù hợp cho sảnh lớn.",
      price: 29800000.0,
      image_url:
        "https://sieuthimaylanh.com/uploads/product/04_2020/may-lanh-tu-dung-panasonic-cs-e28nfq-2-5-hp-inverter.png",
      specifications: JSON.stringify({
        "Công suất": "2.5 HP (~24.000 BTU)",
        "Loại máy": "Inverter",
        "Loại dàn lạnh": "Tủ đứng",
      }),
      status: "active",
      created_at: now,
    }, // --- LG (4 products) ---

    {
      product_id: uuidv4(),
      product_name: "LG DUALCOOL Inverter 1.0 HP V10WIN",
      brand_id: brandMap["LG"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description:
        "Công nghệ DUAL Inverter tiết kiệm điện đến 70%, vận hành êm ái.",
      price: 8350000.0,
      image_url:
        "https://product.hstatic.net/200000358641/product/10054630-may-lanh-lg-inverter-1-hp-v10win-3_86fde3f961a6417eb2b575d391e820ae_master.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.0 HP (~9.200 BTU)",
        "Công nghệ": "DUAL Inverter",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "LG DUALCOOL Inverter 1.5 HP V13WIN",
      brand_id: brandMap["LG"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description: "Tích hợp lọc không khí UVnano, làm lạnh nhanh Jet Cool.",
      price: 10290000.0,
      image_url:
        "https://product.hstatic.net/200000358641/product/10054631-may-lanh-lg-inverter-1-5-hp-v13win-5_a7d544d3cde340dd8a4ffd6887745cd8.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.5 HP (~12.000 BTU)",
        "Công nghệ": "DUAL Inverter, UVnano",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "LG Âm trần 18.000 BTU ZTNQ18GPLE0",
      brand_id: brandMap["LG"],
      category_id: categoryMap["Máy Lạnh Âm Trần (Cassette)"],
      description: "Thiết kế mỏng, tinh tế cho mọi không gian trần.",
      price: 24500000.0,
      image_url:
        "https://dienmaythienphu.vn/wp-content/uploads/2022/12/lg-ZTNQ12GULA0-ZUAA1.jpg",
      specifications: JSON.stringify({
        "Công suất": "2.0 HP (~18.000 BTU)",
        "Loại máy": "Inverter",
      }),
      status: "out_of_stock",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "LG Tủ đứng Inverter 2.5 HP ZPNQ24GS1A0",
      brand_id: brandMap["LG"],
      category_id: categoryMap["Máy Lạnh Tủ Đứng"],
      description:
        "Thiết kế sang trọng, luồng gió mạnh mẽ, làm lạnh không gian lớn.",
      price: 30500000.0,
      image_url:
        "https://sieuthimaylanh.com/uploads/product/11_2022/may-lanh-tu-dung-lg-inverter-2-5hp-zpnq24gs1a0-gas-r32.jpg",
      specifications: JSON.stringify({
        "Công suất": "2.5 HP (~24.000 BTU)",
        "Loại máy": "Inverter",
        "Loại dàn lạnh": "Tủ đứng",
      }),
      status: "active",
      created_at: now,
    }, // --- Samsung (4 products) ---

    {
      product_id: uuidv4(),
      product_name: "Samsung WindFree™ Inverter 1.0 HP AR09TYHQASIN",
      brand_id: brandMap["Samsung"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description:
        "Công nghệ làm lạnh không gió buốt WindFree™, lọc bụi mịn PM 1.0.",
      price: 8990000.0,
      image_url:
        "https://giahoply.vn/data/upload/may-lanh-samsung-ar10mvfhgwknsv.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.0 HP (~9.000 BTU)",
        "Công nghệ": "WindFree™, Digital Inverter Boost",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Samsung WindFree™ Inverter 1.5 HP AR13TYHQASIN",
      brand_id: brandMap["Samsung"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description: "Làm lạnh thông minh AI, kết nối SmartThings.",
      price: 10850000.0,
      image_url:
        "https://sieuthimaylanh.com/uploads/product/05_2021/tu-dong-lam-sach-may-lanh-samsung-wind-free-inverter-ar-tygcdwknsv.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.5 HP (~12.000 BTU)",
        "Công nghệ": "WindFree™, Digital Inverter Boost",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Samsung Âm trần 360 24.000 BTU",
      brand_id: brandMap["Samsung"],
      category_id: categoryMap["Máy Lạnh Âm Trần (Cassette)"],
      description:
        "Thiết kế tròn 360 độ độc đáo, tỏa lạnh đều khắp không gian.",
      price: 34100000.0,
      image_url:
        "https://vinhphatquynhon.vn/wp-content/uploads/2021/06/may-lanh-am-tran-samsung-AC071TN4PKCEA-1.png",
      specifications: JSON.stringify({
        "Công suất": "2.5 HP (~24.000 BTU)",
        "Thiết kế": "Tròn 360 độ",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Dàn nóng Hệ Thống VRF Samsung DVM S2",
      brand_id: brandMap["Samsung"],
      category_id: categoryMap["Hệ Thống VRV / VRF"],
      description: "Hệ thống điều hòa trung tâm hiệu suất cao cho tòa nhà.",
      price: 150000000.0,
      image_url:
        "https://codienkhanhan.com/wp-content/uploads/2025/01/Dan-nong-trung-tam-SamSung-don-1.jpg",
      specifications: JSON.stringify({
        "Loại hệ thống": "VRF (DVM S2)",
        "Công nghệ": "AI",
      }),
      status: "active",
      created_at: now,
    }, // --- Mitsubishi Electric (4 products) ---

    {
      product_id: uuidv4(),
      product_name: "Mitsubishi Electric Inverter 1.0 HP MSY-JP25VF",
      brand_id: brandMap["Mitsubishi Electric"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description: "Bền bỉ, vận hành êm ái với công nghệ PAM Inverter.",
      price: 9890000.0,
      image_url: "https://dienmaygiagoc.com.vn/uploads/product/06_2020/22/may-lanh-mitsubishi-electric-msy-gr25vf-inverter-10hp-kich-thuoc.jpg",
      specifications: JSON.stringify({
        "Công suất": "1.0 HP (~9.000 BTU)",
        "Loại máy": "Inverter",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Mitsubishi Electric Inverter 1.5 HP MSY-JP35VF",
      brand_id: brandMap["Mitsubishi Electric"],
      category_id: categoryMap["Máy Lạnh Treo Tường"],
      description: "Làm lạnh nhanh, lớp phủ chống bám bẩn, dễ dàng vệ sinh.",
      price: 13500000.0,
      image_url: "https://sieuthimaylanh.com/uploads/product/03_2023/dan-nong-multi-mitsubishi-heavy-inverter-1-5-hp-1-5-ngua-scm40zs-s-model-2023-hp1.webp",
      specifications: JSON.stringify({
        "Công suất": "1.5 HP (~12.283 BTU)",
        "Loại máy": "Inverter",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Mitsubishi Electric Âm trần 18.000 BTU",
      brand_id: brandMap["Mitsubishi Electric"],
      category_id: categoryMap["Máy Lạnh Âm Trần (Cassette)"],
      description: "Dòng máy lạnh âm trần Mr. Slim độ bền cao.",
      price: 27100000.0,
      image_url: "https://dienmaythienphu.vn/wp-content/uploads/2021/02/lanh-multi-mitsubishi-FDTC.jpg",
      specifications: JSON.stringify({
        "Công suất": "2.0 HP (~18.000 BTU)",
        "Loại máy": "Inverter",
      }),
      status: "active",
      created_at: now,
    },
    {
      product_id: uuidv4(),
      product_name: "Dàn nóng Mitsubishi Electric Multi MXY-3G28VA2",
      brand_id: brandMap["Mitsubishi Electric"],
      category_id: categoryMap["Máy Lạnh Multi"],
      description: "Dàn nóng multi-split, kết nối 2-3 dàn lạnh.",
      price: 24200000.0,
      image_url: "https://dienmaygiagoc.com.vn/uploads/product/10_2022/13/MXY-3A28VA.jpg",
      specifications: JSON.stringify({
        "Công suất": "~3.0 HP (28.000 BTU)",
        "Kết nối": "Tối đa 3 dàn lạnh",
      }),
      status: "active",
      created_at: now,
    },
  ]; // --- BƯỚC 4: CHÈN DỮ LIỆU ---

  const validProducts = productsData.filter((p) => {
    if (!p.brand_id) {
      console.warn(`⚠️ Bỏ qua sản phẩm "${p.product_name}" do thiếu brand_id.`);
      return false;
    }
    if (!p.category_id) {
      console.warn(
        `⚠️ Bỏ qua sản phẩm "${p.product_name}" do thiếu category_id.`
      );
      return false;
    }
    return true;
  });

  if (validProducts.length > 0) {
    await queryInterface.bulkInsert("products", validProducts, {});
    console.log(`✅ Seeded ${validProducts.length} A/C products`);
  } else {
    console.error(
      "❌ Không thể chèn sản phẩm. Kiểm tra xem seeder 'brands' và 'categories' đã chạy chưa."
    );
  }
};

// Hàm 'down' giữ nguyên
export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete("products", null, {});
  console.log("❌ Emptied products table");
};
