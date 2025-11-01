// src/services/vouchers.service.js

import { Op } from "sequelize";
import db from "../models/index.js";
const { Vouchers, Users, Products, VoucherProducts, sequelize } = db;

// --- CÁC CHỨC NĂNG QUẢN LÝ (ADMIN) ---

/**
 * ----------------------------------------
 * SERVICE: TẠO MỚI VOUCHER
 * (Hỗ trợ tạo voucher cho sản phẩm cụ thể)
 * ----------------------------------------
 */
export const createVoucherService = async (voucherData, productIds = []) => {
  // Bắt đầu một transaction
  const t = await sequelize.transaction();

  try {
    // 1. Kiểm tra logic nghiệp vụ cơ bản
    if (
      new Date(voucherData.expires_at) <=
      new Date(voucherData.created_at || Date.now())
    ) {
      throw new Error("Ngày hết hạn (expires_at) phải sau ngày tạo.");
    }

    // 2. Tạo voucher
    const newVoucher = await Vouchers.create(voucherData, { transaction: t });

    // 3. Nếu là voucher cho sản phẩm cụ thể (specific_products) và có productIds
    if (
      voucherData.applicability_scope === "specific_products" &&
      productIds.length > 0
    ) {
      // Dùng hàm 'set' của Sequelize (yêu cầu 'applicableProducts' là 'as' trong associate)
      await newVoucher.setApplicableProducts(productIds, { transaction: t });
    }

    // 4. Commit transaction
    await t.commit();
    return newVoucher;
  } catch (error) {
    // 5. Rollback nếu có lỗi
    await t.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Mã voucher (code) đã tồn tại.");
    }
    throw new Error(`Không thể tạo voucher: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY TẤT CẢ VOUCHER (CHO ADMIN)
 * ----------------------------------------
 */
export const getAllVouchersService = async (queryParams) => {
  const { page = 1, limit = 10, scope, status } = queryParams;
  const offset = (page - 1) * limit;
  const whereClause = {};

  if (scope) whereClause.applicability_scope = scope;
  if (status) whereClause.is_active = status === "active";

  try {
    const { count, rows } = await Vouchers.findAndCountAll({
      where: whereClause,
      include: [
        { model: Users, as: "user", attributes: ["user_id", "email"] }, // Lấy user (nếu là voucher riêng)
        {
          model: Products,
          as: "applicableProducts",
          attributes: ["product_id", "product_name"],
        }, // Lấy SP áp dụng
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true, // Cần thiết khi include 'belongsToMany'
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      vouchers: rows,
    };
  } catch (error) {
    throw new Error(`Không thể lấy danh sách voucher: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY CHI TIẾT 1 VOUCHER
 * ----------------------------------------
 */
export const getVoucherByIdService = async (voucherId) => {
  try {
    const voucher = await Vouchers.findByPk(voucherId, {
      include: [
        { model: Users, as: "user", attributes: ["user_id", "email"] },
        { model: Products, as: "applicableProducts" }, // Lấy đầy đủ thông tin SP
      ],
    });
    return voucher;
  } catch (error) {
    throw new Error(`Không thể tìm voucher: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT VOUCHER
 * ----------------------------------------
 */
export const updateVoucherService = async (
  voucherId,
  voucherData,
  productIds
) => {
  const t = await sequelize.transaction();
  try {
    const voucher = await Vouchers.findByPk(voucherId);
    if (!voucher) {
      await t.rollback();
      return null;
    }

    // 1. Cập nhật thông tin voucher
    await voucher.update(voucherData, { transaction: t });

    // 2. Cập nhật danh sách sản phẩm (nếu productIds được cung cấp)
    if (Array.isArray(productIds)) {
      if (
        voucherData.applicability_scope === "specific_products" ||
        voucher.applicability_scope === "specific_products"
      ) {
        // Cập nhật lại danh sách SP. Nếu mảng rỗng, nó sẽ xoá hết liên kết.
        await voucher.setApplicableProducts(productIds, { transaction: t });
      }
    }

    await t.commit();
    return voucher;
  } catch (error) {
    await t.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Mã voucher (code) đã tồn tại.");
    }
    throw new Error(`Không thể cập nhật voucher: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: XOÁ VOUCHER
 * ----------------------------------------
 */
export const deleteVoucherService = async (voucherId) => {
  try {
    const voucher = await Vouchers.findByPk(voucherId);
    if (!voucher) return 0;

    // RÀNG BUỘC: Không xoá voucher đã được sử dụng
    if (voucher.usage_count > 0) {
      throw new Error(
        "Không thể xoá voucher đã được sử dụng. Hãy cân nhắc vô hiệu hoá (is_active = false)."
      );
    }

    // Xoá voucher (Sequelize sẽ tự xoá liên kết trong bảng 'VoucherProducts')
    await voucher.destroy();
    return 1;
  } catch (error) {
    throw new Error(error.message);
  }
};

// --- CHỨC NĂNG NGƯỜI DÙNG ---

/**
 * ----------------------------------------
 * SERVICE: XÁC THỰC VÀ ÁP DỤNG VOUCHER
 * (Logic quan trọng nhất)
 * ----------------------------------------
 */
export const applyVoucherService = async (
  code,
  userId,
  cartTotal,
  cartItems = []
) => {
  try {
    const now = new Date();

    // 1. Tìm voucher theo code
    const voucher = await Vouchers.findOne({
      where: { code: code.toUpperCase() }, // Luôn tìm bằng chữ hoa
    });

    // 2. Các bước kiểm tra
    if (!voucher) throw new Error("Mã voucher không hợp lệ.");
    if (!voucher.is_active) throw new Error("Mã voucher không hoạt động.");
    if (voucher.expires_at < now) throw new Error("Mã voucher đã hết hạn.");
    if (voucher.usage_count >= voucher.quantity)
      throw new Error("Mã voucher đã hết lượt sử dụng.");
    if (cartTotal < voucher.min_purchase_amount) {
      throw new Error(
        `Đơn hàng phải có giá trị tối thiểu ${voucher.min_purchase_amount} để áp dụng.`
      );
    }

    // 3. Kiểm tra voucher riêng (private)
    if (voucher.user_id && voucher.user_id !== userId) {
      throw new Error("Mã voucher này không dành cho tài khoản của bạn.");
    }

    // 4. Kiểm tra phạm vi sản phẩm (phần phức tạp)
    let applicableAmount = cartTotal; // Số tiền có thể áp dụng voucher

    if (voucher.applicability_scope === "specific_products") {
      // Lấy danh sách SP được áp dụng của voucher này
      const applicableProducts = await voucher.getApplicableProducts({
        attributes: ["product_id"],
      });
      const applicableProductIds = new Set(
        applicableProducts.map((p) => p.product_id)
      );

      // Tính tổng giá trị của các sản phẩm hợp lệ trong giỏ hàng
      applicableAmount = cartItems
        .filter((item) => applicableProductIds.has(item.product_id))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (applicableAmount === 0) {
        throw new Error(
          "Mã voucher không áp dụng cho các sản phẩm trong giỏ hàng của bạn."
        );
      }
    }

    // 5. Tính toán số tiền giảm
    let discountAmount = 0;

    switch (voucher.discount_type) {
      case "fixed_amount":
        discountAmount = voucher.discount_value;
        // Đảm bảo không giảm nhiều hơn số tiền có thể áp dụng
        if (discountAmount > applicableAmount)
          discountAmount = applicableAmount;
        break;

      case "percentage":
        discountAmount = (applicableAmount * voucher.discount_value) / 100;
        // Kiểm tra mức giảm tối đa
        if (
          voucher.max_discount_amount &&
          discountAmount > voucher.max_discount_amount
        ) {
          discountAmount = voucher.max_discount_amount;
        }
        break;

      case "free_shipping":
        // Loại này có thể cần xử lý đặc biệt (ví dụ: trả về 1 cờ)
        // Tạm thời coi như giảm một số tiền (giả định 30000 là phí ship)
        // LƯU Ý: Cách tốt nhất là trả về 'type' để controller/client tự xử lý
        discountAmount = 30000; // Cần thay đổi logic này
        // Hoặc trả về 1 object đặc biệt
        // return { type: 'free_shipping', message: 'Đã áp dụng miễn phí vận chuyển', voucherId: voucher.voucher_id };
        break;

      default:
        throw new Error("Loại voucher không xác định.");
    }

    // 6. Trả về kết quả
    return {
      voucher_id: voucher.voucher_id,
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: discountAmount,
      original_total: cartTotal,
      final_total: cartTotal - discountAmount,
    };
  } catch (error) {
    // Chỉ ném lại lỗi (để controller bắt)
    throw error;
  }
};
