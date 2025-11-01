import express from "express";

// 1. Import các controller functions
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categories.controller.js"; // (Giả định đường dẫn)

// 2. Khởi tạo router
const routeForCategory = express.Router();

// 3. Định nghĩa các routes

// @route POST /api/categories
// @desc Tạo danh mục mới
routeForCategory.post("/", createCategoryController);

// @route GET /api/categories
// @desc Lấy tất cả danh mục (dạng cây)
routeForCategory.get("/", getAllCategoriesController);

// @route GET /api/categories/:id
// @desc Lấy chi tiết một danh mục
routeForCategory.get("/:id", getCategoryByIdController);

// @route PUT /api/categories/:id
// @desc Cập nhật một danh mục
routeForCategory.put("/:id", updateCategoryController);

// @route DELETE /api/categories/:id
// @desc Xoá một danh mục
routeForCategory.delete("/:id", deleteCategoryController);

// 4. Export router
export default routeForCategory;
