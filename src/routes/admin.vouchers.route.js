import express from "express";

// 1. Import các controller functions của ADMIN
import {
  createVoucherController,
  getAllVouchersController,
  getVoucherByIdController,
  updateVoucherController,
  deleteVoucherController,
} from "../controllers/vouchers.controller.js"; // (Giả định đường dẫn)
import { checkAdmin, checkAuth } from "../middlewares/auth.middleware.js";

// 2. Import middleware (BẮT BUỘC)
// 3. Khởi tạo router
const routeForAdminVoucher = express.Router();

// 4. Áp dụng middleware checkAuth và checkAdmin cho TẤT CẢ route
routeForAdminVoucher.use(checkAuth, checkAdmin);

// 5. Định nghĩa các routes cho Admin

// @route POST /api/admin/vouchers
// @desc (Admin) Tạo voucher mới
routeForAdminVoucher.post("/", createVoucherController);

// @route GET /api/admin/vouchers
// @desc (Admin) Lấy tất cả voucher
routeForAdminVoucher.get("/", getAllVouchersController);

// @route GET /api/admin/vouchers/:id
// @desc (Admin) Lấy chi tiết 1 voucher
routeForAdminVoucher.get("/:id", getVoucherByIdController);

// @route PUT /api/admin/vouchers/:id
// @desc (Admin) Cập nhật voucher
routeForAdminVoucher.put("/:id", updateVoucherController);

// @route DELETE /api/admin/vouchers/:id
// @desc (Admin) Xoá voucher
routeForAdminVoucher.delete("/:id", deleteVoucherController);

// 6. Export router
export default routeForAdminVoucher;
