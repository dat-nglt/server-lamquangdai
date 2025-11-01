import express from "express";

// 1. Import các controller của ADMIN
import {
  getAllOrdersController,
  getOrderDetailsController,
  updateOrderStatusController,
} from "../controllers/orders.controller.js"; // (Giả định đường dẫn)

// 2. Import middleware xác thực (BẮT BUỘC)
import { checkAuth, checkAdmin } from "../middlewares/auth.middleware.js"; // (Giả định đường dẫn)

// 3. Khởi tạo router
const routeForAdminOrder = express.Router();

// 4. Áp dụng middleware checkAuth và checkAdmin cho TẤT CẢ route
routeForAdminOrder.use(checkAuth, checkAdmin);

// 5. Định nghĩa các routes cho Admin

// @route GET /api/admin/orders
// @desc (Admin) Lấy tất cả đơn hàng (có lọc/phân trang)
routeForAdminOrder.get("/", getAllOrdersController);

// @route GET /api/admin/orders/:id
// @desc (Admin) Lấy chi tiết 1 đơn hàng bất kỳ
routeForAdminOrder.get("/:id", getOrderDetailsController);

// @route PATCH /api/admin/orders/:id/status
// @desc (Admin) Cập nhật trạng thái đơn hàng
routeForAdminOrder.patch("/:id/status", updateOrderStatusController);

// 6. Export router
export default routeForAdminOrder;
