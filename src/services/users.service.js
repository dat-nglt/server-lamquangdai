// src/services/users.service.js

import db from "../models/index.js";
const { Users, Memberships, Orders } = db;

/**
 * ----------------------------------------
 * SERVICE: LẤY HỒ SƠ CÁ NHÂN
 * (Hàm này được dùng bởi cả User và Admin)
 * ----------------------------------------
 */
export const getUserProfileService = async (userId) => {
  try {
    const user = await Users.findByPk(userId, {
      // Loại bỏ mật khẩu
      attributes: { exclude: ["password"] },
      // Lấy kèm thông tin thành viên (điểm, hạng)
      include: [{ model: Memberships }],
    });
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT HỒ SƠ CÁ NHÂN
 * ----------------------------------------
 */
export const updateUserProfileService = async (userId, updateData) => {
  try {
    const user = await Users.findByPk(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // Chỉ cho phép cập nhật các trường này
    const { full_name, email, address } = updateData;
    const updatedUser = await user.update({ full_name, email, address });

    updatedUser.password = undefined; // Đảm bảo không trả về password
    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

// --- CÁC HÀM CHO ADMIN ---

/**
 * ----------------------------------------
 * SERVICE: (Admin) LẤY TẤT CẢ NGƯỜI DÙNG
 * ----------------------------------------
 */
export const getAllUsersService = async (queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Users.findAndCountAll({
      attributes: { exclude: ["password"] },
      include: [{ model: Memberships }],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      users: rows,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * ----------------------------------------
 * SERVICE: (Admin) CẬP NHẬT NGƯỜI DÙNG
 * ----------------------------------------
 */
export const updateUserByAdminService = async (userId, updateData) => {
  try {
    const user = await Users.findByPk(userId);
    if (!user) throw new Error("Không tìm thấy người dùng.");

    // Admin có thể cập nhật cả 'role'
    const { full_name, email, address, phone, role } = updateData;
    await user.update({ full_name, email, address, phone, role });

    user.password = undefined;
    return user;
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Số điện thoại đã tồn tại.");
    }
    throw new Error(error.message);
  }
};

/**
 * ----------------------------------------
 * SERVICE: (Admin) XOÁ NGƯỜI DÙNG
 * ----------------------------------------
 */
export const deleteUserByAdminService = async (userId) => {
  try {
    const user = await Users.findByPk(userId);
    if (!user) throw new Error("Không tìm thấy người dùng.");

    // RÀNG BUỘC: Không xoá user đã có đơn hàng
    const orderCount = await Orders.count({ where: { user_id: userId } });
    if (orderCount > 0) {
      throw new Error("Không thể xoá người dùng này vì họ đã có đơn hàng.");
    }

    // (Logic nâng cao: Xoá Memberships, Cart, ... của user này trước)
    await Memberships.destroy({ where: { user_id: userId } });
    // ...

    await user.destroy();
    return 1; // Xoá thành công
  } catch (error) {
    throw new Error(error.message);
  }
};
