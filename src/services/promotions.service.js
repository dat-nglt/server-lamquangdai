// src/services/promotions.service.js

import { Op } from "sequelize"; // Cần Op để so sánh ngày
import db from "../models/index.js";
const { Promotions } = db;

// Hàm trợ giúp kiểm tra logic ngày
const validateDates = (startDate, endDate) => {
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error(
      "Ngày kết thúc (end_date) phải sau ngày bắt đầu (start_date)."
    );
  }
};

/**
 * ----------------------------------------
 * SERVICE: TẠO MỚI KHUYẾN MÃI
 * ----------------------------------------
 */
export const createPromotionService = async (promoData) => {
  const {
    title,
    description,
    discount_percent,
    start_date,
    end_date,
    image_url,
  } = promoData;

  try {
    // 1. Kiểm tra logic nghiệp vụ về ngày
    validateDates(start_date, end_date);

    // 2. Tạo mới
    const newPromotion = await Promotions.create({
      title,
      description,
      discount_percent,
      start_date,
      end_date,
      image_url,
    });
    return newPromotion;
  } catch (error) {
    // 3. Xử lý lỗi (từ validateDates hoặc Sequelize validation)
    throw new Error(`Không thể tạo khuyến mãi: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY TẤT CẢ KHUYẾN MÃI (Hỗ trợ lọc)
 * ----------------------------------------
 */
export const getAllPromotionsService = async (queryParams) => {
  const { status } = queryParams;
  const whereClause = {};
  const now = new Date();

  // Bổ sung logic lọc theo trạng thái:
  if (status === "active") {
    // Đang hoạt động: now >= start_date AND now <= end_date
    whereClause.start_date = { [Op.lte]: now };
    whereClause.end_date = { [Op.gte]: now };
  } else if (status === "upcoming") {
    // Sắp diễn ra: now < start_date
    whereClause.start_date = { [Op.gt]: now };
  } else if (status === "expired") {
    // Đã kết thúc: now > end_date
    whereClause.end_date = { [Op.lt]: now };
  }

  try {
    const promotions = await Promotions.findAll({
      where: whereClause,
      order: [["start_date", "DESC"]], // Sắp xếp theo ngày bắt đầu mới nhất
    });
    return promotions;
  } catch (error) {
    throw new Error(`Không thể lấy danh sách khuyến mãi: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY CHI TIẾT KHUYẾN MÃI
 * ----------------------------------------
 */
export const getPromotionByIdService = async (promoId) => {
  try {
    const promotion = await Promotions.findByPk(promoId);
    return promotion; // Trả về null nếu không tìm thấy
  } catch (error) {
    throw new Error(`Không thể tìm khuyến mãi: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT KHUYẾN MÃI
 * ----------------------------------------
 */
export const updatePromotionService = async (promoId, updateData) => {
  try {
    const promotion = await Promotions.findByPk(promoId);
    if (!promotion) {
      return null; // Không tìm thấy
    }

    // 1. Kiểm tra logic ngày nếu cả hai được cập nhật
    // Lấy ngày mới (nếu có) hoặc giữ ngày cũ để so sánh
    const newStartDate = updateData.start_date || promotion.start_date;
    const newEndDate = updateData.end_date || promotion.end_date;

    validateDates(newStartDate, newEndDate);

    // 2. Cập nhật
    const updatedPromotion = await promotion.update(updateData);
    return updatedPromotion;
  } catch (error) {
    // 3. Xử lý lỗi (từ validateDates hoặc Sequelize validation)
    throw new Error(`Không thể cập nhật khuyến mãi: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: XOÁ KHUYẾN MÃI
 * ----------------------------------------
 */
export const deletePromotionService = async (promoId) => {
  try {
    // (Logic bổ sung: Kiểm tra xem khuyến mãi này có đang được áp dụng
    // cho đơn hàng nào không trước khi xoá. Hiện tại model chưa có liên kết này)

    const deletedRowCount = await Promotions.destroy({
      where: { promo_id: promoId },
    });
    return deletedRowCount; // 0 hoặc 1
  } catch (error) {
    throw new Error(`Không thể xoá khuyến mãi: ${error.message}`);
  }
};
