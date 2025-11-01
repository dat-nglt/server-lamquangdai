// src/controllers/vouchers.controller.js

import * as voucherService from "../services/vouchers.service.js";

// --- CONTROLLER QUẢN LÝ (ADMIN) ---

/**
 * ----------------------------------------
 * CONTROLLER: TẠO MỚI VOUCHER
 * ----------------------------------------
 */
export const createVoucherController = async (req, res) => {
  try {
    // product_ids là một mảng UUID của sản phẩm (nếu có)
    const { product_ids, ...voucherData } = req.body;

    // Chuyển code thành chữ hoa để đảm bảo unique
    if (voucherData.code) {
      voucherData.code = voucherData.code.toUpperCase();
    }

    // Validate input cơ bản
    if (
      !voucherData.code ||
      !voucherData.discount_type ||
      !voucherData.discount_value ||
      !voucherData.expires_at ||
      !voucherData.quantity
    ) {
      return res.status(400).json({
        message:
          "code, discount_type, discount_value, expires_at, và quantity là bắt buộc.",
      });
    }

    const newVoucher = await voucherService.createVoucher(
      voucherData,
      product_ids
    );
    res.status(201).json(newVoucher);
  } catch (error) {
    if (error.message.includes("đã tồn tại")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    if (error.message.includes("phải sau ngày")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY TẤT CẢ VOUCHER (ADMIN)
 * ----------------------------------------
 */
export const getAllVouchersController = async (req, res) => {
  try {
    const result = await voucherService.getAllVouchers(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY CHI TIẾT 1 VOUCHER
 * ----------------------------------------
 */
export const getVoucherByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await voucherService.getVoucherById(id);
    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }
    res.status(200).json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT VOUCHER
 * ----------------------------------------
 */
export const updateVoucherController = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_ids, ...voucherData } = req.body; // Tách product_ids

    // Chuyển code thành chữ hoa
    if (voucherData.code) {
      voucherData.code = voucherData.code.toUpperCase();
    }

    const updatedVoucher = await voucherService.updateVoucher(
      id,
      voucherData,
      product_ids
    );
    if (!updatedVoucher) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy voucher để cập nhật" });
    }
    res.status(200).json(updatedVoucher);
  } catch (error) {
    if (error.message.includes("đã tồn tại")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: XOÁ VOUCHER
 * ----------------------------------------
 */
export const deleteVoucherController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await voucherService.deleteVoucher(id);
    if (deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy voucher để xoá" });
    }
    res.status(204).send();
  } catch (error) {
    if (error.message.includes("đã được sử dụng")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// --- CONTROLLER NGƯỜI DÙNG ---

/**
 * ----------------------------------------
 * CONTROLLER: ÁP DỤNG VOUCHER (NGƯỜI DÙNG)
 * ----------------------------------------
 */
export const applyVoucherController = async (req, res) => {
  try {
    // Giả sử middleware xác thực đã gắn req.user.user_id
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "Yêu cầu xác thực." });
    }

    // Người dùng gửi code, tổng tiền giỏ hàng, và chi tiết giỏ hàng
    const { code, cart_total, cart_items } = req.body;

    if (!code || cart_total === undefined) {
      return res
        .status(400)
        .json({ message: "code và cart_total là bắt buộc." });
    }

    // Gọi service để xác thực
    const result = await voucherService.applyVoucher(
      code,
      userId,
      cart_total,
      cart_items
    );

    // Nếu thành công, trả về kết quả tính toán
    res.status(200).json(result);
  } catch (error) {
    // Service sẽ ném lỗi nếu voucher không hợp lệ
    // Bắt lỗi đó và trả về 400 (Bad Request)
    res.status(400).json({ message: error.message });
  }
};
