import { createPromotionService, deletePromotionService, getAllPromotionsService, getPromotionByIdService, updatePromotionService } from "../services/promotions.service.js";

/**
 * ----------------------------------------
 * CONTROLLER: TẠO MỚI KHUYẾN MÃI
 * ----------------------------------------
 */
export const createPromotionController = async (req, res) => {
  try {
    // 1. Validate input cơ bản
    const { title, discount_percent, start_date, end_date } = req.body;
    if (!title || !discount_percent || !start_date || !end_date) {
      return res.status(400).json({
        message: "title, discount_percent, start_date, và end_date là bắt buộc",
      });
    }

    // 2. Gọi service
    const newPromotion = await createPromotionService(req.body);

    // 3. Trả về
    res.status(201).json(newPromotion);
  } catch (error) {
    // 4. Xử lý lỗi (ví dụ: lỗi logic ngày tháng, lỗi validation)
    if (error.message.includes("phải sau ngày bắt đầu")) {
      return res.status(400).json({ message: error.message });
    }
    // Lỗi từ model (ví dụ: discount > 100)
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY TẤT CẢ KHUYẾN MÃI (Hỗ trợ lọc)
 * ----------------------------------------
 */
export const getAllPromotionsController = async (req, res) => {
  try {
    // Truyền query params (ví dụ: ?status=active) vào service
    const promotions = await getAllPromotionsService(req.query);
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY CHI TIẾT KHUYẾN MÃI
 * ----------------------------------------
 */
export const getPromotionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await getPromotionByIdService(id);

    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT KHUYẾN MÃI
 * ----------------------------------------
 */
export const updatePromotionController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updatedPromotion = await updatePromotionService(id, updateData);

    if (!updatedPromotion) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khuyến mãi để cập nhật" });
    }

    res.status(200).json(updatedPromotion);
  } catch (error) {
    // Xử lý lỗi logic ngày tháng
    if (error.message.includes("phải sau ngày bắt đầu")) {
      return res.status(400).json({ message: error.message });
    }
    // Lỗi từ model
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: XOÁ KHUYẾN MÃI
 * ----------------------------------------
 */
export const deletePromotionController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await deletePromotionService(id);

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khuyến mãi để xoá" });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
