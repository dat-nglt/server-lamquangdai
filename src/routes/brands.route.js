import express from "express";

// 1. Import các controller functions
import {
  createBrandController,
  getAllBrandsController,
  getBrandByIdController,
  updateBrandController,
  deleteBrandController,
} from "../controllers/brands.controller.js"; // (Giả định đường dẫn)

// 2. Khởi tạo router
const routeForBrand = express.Router();

// 3. Định nghĩa các routes

// @route POST /api/brands
// @desc Tạo thương hiệu mới
routeForBrand.post("/", createBrandController);

// @route GET /api/brands
// @desc Lấy tất cả thương hiệu
routeForBrand.get("/", getAllBrandsController);

// @route GET /api/brands/:id
// @desc Lấy chi tiết một thương hiệu
routeForBrand.get("/:id", getBrandByIdController);

// @route PUT /api/brands/:id
// @desc Cập nhật một thương hiệu
routeForBrand.put("/:id", updateBrandController);

// @route DELETE /api/brands/:id
// @desc Xoá một thương hiệu
routeForBrand.delete("/:id", deleteBrandController);

// 4. Export router
export default routeForBrand;
