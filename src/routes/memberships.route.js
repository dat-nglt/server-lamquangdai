import express from "express";

// 1. Import các controller functions
import {
  getAllMembershipsController,
  getMyMembershipController,
  getMembershipByUserIdController,
  addPointsController,
  updateMembershipController,
} from "../controllers/memberships.controller.js"; // (Giả định đường dẫn)

// 2. Import middleware xác thực (GIẢ ĐỊNH)
// Các controller của bạn YÊU CẦU các middleware này để chạy đúng
import { checkAuth, checkAdmin } from "../middlewares/auth.middleware.js"; // (Giả định đường dẫn)

// 3. Khởi tạo router
const routeForMembership = express.Router();

// 4. Định nghĩa các routes

// === Route cho Người dùng (User) ===

// @route GET /api/memberships/me
// @desc Lấy thông tin thành viên của TÔI
routeForMembership.get(
  "/me",
  checkAuth, // Cần xác thực để lấy req.user.user_id
  getMyMembershipController
);

// === Các Route cho Quản trị viên (Admin) ===

// @route GET /api/memberships
// @desc (Admin) Lấy tất cả thành viên
routeForMembership.get(
  "/",
  checkAuth,
  checkAdmin, // Yêu cầu quyền admin
  getAllMembershipsController
);

// @route GET /api/memberships/user/:userId
// @desc (Admin) Lấy thông tin thành viên của 1 user
routeForMembership.get(
  "/user/:userId",
  checkAuth,
  checkAdmin,
  getMembershipByUserIdController
);

// @route POST /api/memberships/user/:userId/add-points
// @desc (Admin/System) Cộng/trừ điểm cho user
routeForMembership.post(
  "/user/:userId/add-points",
  checkAuth,
  checkAdmin, // Hoặc một API key hệ thống
  addPointsController
);

// @route PUT /api/memberships/user/:userId
// @desc (Admin) Cập nhật thủ công điểm/hạng
routeForMembership.put(
  "/user/:userId",
  checkAuth,
  checkAdmin,
  updateMembershipController
);

// 5. Export router
export default routeForMembership;
