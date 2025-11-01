import express from "express";

// 1. Import controller function của USER
import { applyVoucherController } from "../controllers/vouchers.controller.js"; // (Giả định đường dẫn)

// 2. Import middleware (BẮT BUỘC)
import { checkAuth } from "../middlewares/auth.middleware.js"; // (Giả định đường dẫn)

// 3. Khởi tạo router
const routeForVoucher = express.Router();

// 4. Định nghĩa route cho User
// Route này yêu cầu checkAuth để lấy req.user.user_id

// @route POST /api/vouchers/apply
// @desc (User) Áp dụng mã voucher vào giỏ hàng
routeForVoucher.post("/apply", checkAuth, applyVoucherController);

// 5. Export router
export default routeForVoucher;
