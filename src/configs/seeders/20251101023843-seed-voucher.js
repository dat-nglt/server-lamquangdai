import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // --- Cấu hình ngày ---
  const now = new Date();

  // Ngày hết hạn (vd: 1 tháng kể từ hôm nay)
  const futureDate = new Date(now);
  futureDate.setMonth(futureDate.getMonth() + 1);

  // Ngày đã hết hạn (vd: ngày hôm qua)
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 1);

  // --- Dữ liệu mẫu ---
  const vouchersData = [
    // 1. Voucher giảm tiền (fixed_amount)
    {
      voucher_id: uuidv4(),
      code: "GIAM50K",
      description: "Giảm 50.000đ cho đơn hàng từ 200.000đ.",
      user_id: null, // Voucher chung
      discount_type: "fixed_amount",
      discount_value: 50000,
      max_discount_amount: null,
      min_purchase_amount: 200000,
      quantity: 1000,
      usage_count: 0,
      applicability_scope: "all_products",
      is_active: true,
      created_at: now,
      expires_at: futureDate, // 1 tháng nữa hết hạn
    },

    // 2. Voucher giảm phần trăm (percentage)
    {
      voucher_id: uuidv4(),
      code: "SALE20",
      description: "Giảm 20%, tối đa 30.000đ.",
      user_id: null, // Voucher chung
      discount_type: "percentage",
      discount_value: 20, // 20%
      max_discount_amount: 30000, // Giảm tối đa 30k
      min_purchase_amount: 0,
      quantity: 500,
      usage_count: 0,
      applicability_scope: "all_products",
      is_active: true,
      created_at: now,
      expires_at: futureDate,
    },

    // 3. Voucher miễn phí vận chuyển (free_shipping)
    {
      voucher_id: uuidv4(),
      code: "FREESHIP",
      description: "Miễn phí vận chuyển, giảm tối đa 25.000đ cho đơn từ 50k.",
      user_id: null, // Voucher chung
      discount_type: "free_shipping",
      discount_value: 0, // Giá trị giảm sẽ được tính theo phí ship
      max_discount_amount: 25000, // Giảm tối đa 25k tiền ship
      min_purchase_amount: 50000,
      quantity: 2000,
      usage_count: 0,
      applicability_scope: "all_products",
      is_active: true,
      created_at: now,
      expires_at: futureDate,
    },

    // 4. Voucher áp dụng cho sản phẩm cụ thể (specific_products)
    {
      voucher_id: uuidv4(),
      code: "MAYLANH10",
      description: "Giảm 10% cho danh mục Máy lạnh.",
      user_id: null, // Voucher chung
      discount_type: "percentage",
      discount_value: 10,
      max_discount_amount: 500000, // Giảm tối đa 500k
      min_purchase_amount: 0,
      quantity: 100,
      usage_count: 0,
      applicability_scope: "specific_products", // 👈 Quan trọng
      is_active: true,
      created_at: now,
      expires_at: futureDate,
    },

    // 5. Voucher đã hết hạn (để test)
    {
      voucher_id: uuidv4(),
      code: "EXPIRED",
      description: "Voucher đã hết hạn từ hôm qua.",
      user_id: null, // Voucher chung
      discount_type: "fixed_amount",
      discount_value: 10000,
      max_discount_amount: null,
      min_purchase_amount: 0,
      quantity: 10,
      usage_count: 0,
      applicability_scope: "all_products",
      is_active: true, // Vẫn active, nhưng CSDL sẽ check expires_at
      created_at: pastDate,
      expires_at: pastDate, // 👈 Đã hết hạn
    },
  ];

  // Chèn dữ liệu vào bảng 'vouchers'
  await queryInterface.bulkInsert("vouchers", vouchersData, {});
  console.log("✅ Seeded vouchers table");
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'vouchers'
  await queryInterface.bulkDelete("vouchers", null, {});
  console.log("❌ Emptied vouchers table");
};
