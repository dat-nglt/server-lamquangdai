import express from "express";

// 1. Import các controller functions
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../controllers/products.controller.js"; // (Giả định đường dẫn)

// 2. Khởi tạo router
const routeForProduct = express.Router();

// 3. Định nghĩa các routes

// @route POST /api/products
// @desc Tạo sản phẩm mới
routeForProduct.post("/", createProductController);

// @route GET /api/products
// @desc Lấy tất cả sản phẩm (hỗ trợ lọc/phân trang)
routeForProduct.get("/", getAllProductsController);

// @route GET /api/products/:id
// @desc Lấy chi tiết một sản phẩm
routeForProduct.get("/:id", getProductByIdController);

// @route PUT /api/products/:id
// @desc Cập nhật một sản phẩm
routeForProduct.put("/:id", updateProductController);

// @route DELETE /api/products/:id
// @desc Xoá một sản phẩm
routeForProduct.delete("/:id", deleteProductController);

// 4. Export router
export default routeForProduct;
