import express from "express";

// 1. Import các controller của USER
import {
  createOrderController,
  getMyOrdersController,
  getMyOrderDetailsController,
  cancelMyOrderController,
} from "../controllers/orders.controller.js"; // (Giả định đường dẫn)

// 2. Import middleware xác thực (BẮT BUỘC)
import { checkAuth } from "../middlewares/auth.middleware.js"; // (Giả định đường dẫn)

// 3. Khởi tạo router
const routeForOrder = express.Router();

// 4. Áp dụng middleware checkAuth cho TẤT CẢ các route bên dưới
// Vì mọi controller này đều cần req.user.user_id
routeForOrder.use(checkAuth);

// 5. Định nghĩa các routes cho User

// @route POST /api/orders
// @desc (User) Tạo đơn hàng (Checkout)
routeForOrder.post("/", createOrderController);

// @route GET /api/orders/me
// @desc (User) Lấy lịch sử đơn hàng CỦA TÔI
routeForOrder.get("/me", getMyOrdersController);

// @route GET /api/orders/me/:id
// @desc (User) Lấy chi tiết đơn hàng CỦA TÔI
routeForOrder.get("/me/:id", getMyOrderDetailsController);

// @route PATCH /api/orders/me/:id/cancel
// @desc (User) Tự huỷ đơn hàng
routeForOrder.patch("/me/:id/cancel", cancelMyOrderController);

// 6. Export router
export default routeForOrder;
