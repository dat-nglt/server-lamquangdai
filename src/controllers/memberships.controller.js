// src/controllers/memberships.controller.js

import {
  addPointsToUserService,
  findOrCreateMembershipService,
  getAllMembershipsService,
  getMembershipByUserIdService,
  updateMembershipDetailsService,
} from "../services/memberships.service.js";

/**
 * ----------------------------------------
 * CONTROLLER: LẤY DANH SÁCH THÀNH VIÊN (Admin)
 * (GET /api/memberships)
 * ----------------------------------------
 */
export const getAllMembershipsController = async (req, res) => {
  try {
    // req.query chứa (page, limit, level, sort, order)
    const result = await getAllMembershipsService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY THÔNG TIN CỦA TÔI (User)
 * (GET /api/memberships/me)
 * ----------------------------------------
 */
export const getMyMembershipController = async (req, res) => {
  try {
    // Giả sử middleware checkAuth đã gắn req.user.user_id
    const userId = req.user?.user_id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    const membership = await getMembershipByUserIdService(userId);
    res.status(200).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY THÔNG TIN CỦA 1 USER (Admin)
 * (GET /api/memberships/user/:userId)
 * ----------------------------------------
 */
export const getMembershipByUserIdController = async (req, res) => {
  try {
    const { userId } = req.params;
    const membership = await getMembershipByUserIdService(userId);
    res.status(200).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CỘNG/TRỪ ĐIỂM (Admin/System)
 * (POST /api/memberships/user/:userId/add-points)
 * ----------------------------------------
 */
export const addPointsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points } = req.body; // Ví dụ: { "points": 50 } hoặc { "points": -10 }

    if (points === undefined || typeof points !== "number") {
      return res
        .status(400)
        .json({ message: 'Giá trị "points" (dạng số) là bắt buộc' });
    }

    const updatedMembership = await addPointsToUserService(userId, points);
    res.status(200).json(updatedMembership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT THỦ CÔNG (Admin)
 * (PUT /api/memberships/user/:userId)
 * ----------------------------------------
 */
export const updateMembershipController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, level } = req.body; // Ví dụ: { "points": 100 } hoặc { "level": "gold" }

    if (points === undefined && level === undefined) {
      return res
        .status(400)
        .json({ message: 'Cần cung cấp "points" hoặc "level" để cập nhật' });
    }

    // Validate 'level' nếu có
    if (level && !["bronze", "silver", "gold", "platinum"].includes(level)) {
      return res.status(400).json({ message: 'Giá trị "level" không hợp lệ' });
    }

    const updatedMembership = await updateMembershipDetailsService(userId, {
      points,
      level,
    });
    res.status(200).json(updatedMembership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
