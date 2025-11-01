import express from "express";

// 1. Import các controller functions
import {
  createPromotionController,
  getAllPromotionsController,
  getPromotionByIdController,
  updatePromotionController,
  deletePromotionController,
} from "../controllers/promotions.controller.js"; // (Giả định đường dẫn)

// 2. Khởi tạo router
const routeForPromotion = express.Router();

// 3. Định nghĩa các routes

// @route POST /api/promotions
// @desc Tạo khuyến mãi mới
routeForPromotion.post("/", createPromotionController);

// @route GET /api/promotions
// @desc Lấy tất cả khuyến mãi (hỗ trợ lọc)
routeForPromotion.get("/", getAllPromotionsController);

// @route GET /api/promotions/:id
// @desc Lấy chi tiết một khuyến mãi
routeForPromotion.get("/:id", getPromotionByIdController);

// @route PUT /api/promotions/:id
// @desc Cập nhật một khuyến mãi
routeForPromotion.put("/:id", updatePromotionController);

// @route DELETE /api/promotions/:id
// @desc Xoá một khuyến mãi
routeForPromotion.delete("/:id", deletePromotionController);

// 4. Export router
export default routeForPromotion;
