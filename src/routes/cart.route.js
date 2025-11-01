import express from "express";

// 1. Import các controller functions
import {
  getMyCartController,
  addItemController,
  updateItemController,
  removeItemController,
  clearMyCartController,
} from "../controllers/cart.controller.js"; // (Giả định đường dẫn)

// 2. Import middleware xác thực (RẤT QUAN TRỌNG)
import { checkAuth } from "../middlewares/auth.middleware.js"; // (Giả định đường dẫn)

// 3. Khởi tạo router
const routeForCart = express.Router();

// 4. Áp dụng middleware checkAuth cho TẤT CẢ các route bên dưới
// Vì mọi controller đều gọi getUserIdFromRequest(req)
routeForCart.use(checkAuth);

// 5. Định nghĩa các routes

// @route GET /api/cart
// @desc Lấy giỏ hàng của user
routeForCart.get("/", getMyCartController);

// @route POST /api/cart
// @desc Thêm/tăng số lượng sản phẩm
routeForCart.post("/", addItemController);

// @route PUT /api/cart/:productId
// @desc Cập nhật (set) số lượng 1 sản phẩm
routeForCart.put("/:productId", updateItemController);

// @route DELETE /api/cart/:productId
// @desc Xoá 1 sản phẩm khỏi giỏ
routeForCart.delete("/:productId", removeItemController);

// @route DELETE /api/cart
// @desc Xoá toàn bộ giỏ hàng
routeForCart.delete("/", clearMyCartController);

// 6. Export router
export default routeForCart;
