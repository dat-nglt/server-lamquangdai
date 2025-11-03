// src/controllers/users.controller.js

import * as usersService from "../services/users.service.js";

/**
 * ----------------------------------------
 * CONTROLLER: LẤY HỒ SƠ CÁ NHÂN (CỦA TÔI)
 * (Dùng cho User)
 * ----------------------------------------
 */
export const getMyProfileController = async (req, res) => {
  try {
    // Middleware 'checkAuth' đã chạy và gắn 'req.user'
    // 'req.user' là đối tượng user đầy đủ từ CSDL (dựa trên thiết kế middleware)

    // Tối ưu: Nếu middleware checkAuth đã lấy user (bao gồm Memberships),
    // chúng ta có thể trả về req.user trực tiếp.
    if (req.user) {
      // Chỉ cần đảm bảo mật khẩu không bị lộ
      req.user.password = undefined;
      return res.status(200).json(req.user);
    }

    // Dự phòng: Nếu req.user chỉ có { user_id, role }
    const userId = req.user.user_id;
    const userProfile = await usersService.getUserProfileService(userId);

    if (!userProfile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ." });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT HỒ SƠ CÁ NHÂN (CỦA TÔI)
 * ----------------------------------------
 */
export const updateMyProfileController = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy từ middleware
    const updatedUser = await usersService.updateUserProfileService(
      userId,
      req.body
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- CÁC CONTROLLER CHO ADMIN ---
// (Các route này phải được bảo vệ bằng checkAuth và checkAdmin)

/**
 * ----------------------------------------
 * CONTROLLER: (Admin) LẤY TẤT CẢ NGƯỜI DÙNG
 * ----------------------------------------
 */
export const getAllUsersController = async (req, res) => {
  try {
    const result = await usersService.getAllUsersService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: (Admin) LẤY 1 NGƯỜI DÙNG BẰNG ID
 * ----------------------------------------
 */
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersService.getUserProfileService(id); // Dùng lại service lấy hồ sơ
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: (Admin) CẬP NHẬT NGƯỜI DÙNG
 * ----------------------------------------
 */
export const updateUserByAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await usersService.updateUserByAdminService(
      id,
      req.body
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("đã tồn tại")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: (Admin) XOÁ NGƯỜI DÙNG
 * ----------------------------------------
 */
export const deleteUserByAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    await usersService.deleteUserByAdminService(id);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("đã có đơn hàng")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
