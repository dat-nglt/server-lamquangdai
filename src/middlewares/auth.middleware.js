// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { getUserProfileService } from "../services/users.service.js";

export const checkAuth = async (req, res, next) => {
  try {
    // // 1. Lấy token từ header (Cách của middleware 1)
    // const authHeader = req.headers.authorization;
    // if (!authHeader) {
    //   return res.status(401).json({
    //     message: "Xác thực thất bại: Yêu cầu cần có token.",
    //   });
    // }

    // const token = authHeader.split(" ")[1];
    // if (!token) {
    //   return res.status(401).json({
    //     message: "Xác thực thất bại: Định dạng token không hợp lệ.",
    //   });
    // }

    // // 2. Xác thực token
    // const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // // 3. KIỂM TRA CSDL (Logic bảo mật của middleware 2)
    // // Lấy ID người dùng từ payload của token
    // const userInfo = await getUserProfileService(decodedToken.id); // Hoặc decodedToken.user_id

    // if (!userInfo) {
    //   logger.warn(
    //     `Xác thực thất bại: User ID ${decodedToken.id} không còn tồn tại.`
    //   );
    //   return res
    //     .status(401)
    //     .json({ message: "Người dùng không tồn tại hoặc đã bị xóa." });
    // }

    // // 4. Gắn thông tin user (đầy đủ từ CSDL) vào request
    // req.user = userInfo; // Gắn toàn bộ object user

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Xác thực thất bại: Token đã hết hạn." });
    }
    logger.error("Lỗi checkAuth:", error);
    return res
      .status(401)
      .json({ message: "Xác thực thất bại: Token không hợp lệ." });
  }
};

// Giữ nguyên checkAdmin
export const checkAdmin = (req, res, next) => {
  // if (!req.user) {
  //   return res.status(401).json({
  //     message: "Lỗi xác thực (chưa chạy checkAuth).",
  //   });
  // }

  // // Đọc role từ object user đã được gán
  // if (req.user.role !== "admin") {
  //   return res.status(403).json({
  //     message: "Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (Admin).",
  //   });
  // }

  next();
};
