// src/services/memberships.service.js

import db from "../models/index.js";
const { Memberships, Users, sequelize } = db;

/**
 * ----------------------------------------
 * LOGIC NGHIỆP VỤ: TÍNH TOÁN HẠNG
 * ----------------------------------------
 */

// Định nghĩa các ngưỡng điểm
const LEVEL_THRESHOLDS = {
  platinum: 10000,
  gold: 5000,
  silver: 1000,
  bronze: 0,
};

/**
 * Hàm trợ giúp để tính toán level dựa trên điểm
 * @param {number} points - Tổng số điểm
 * @returns {string} Tên hạng ('bronze', 'silver', 'gold', 'platinum')
 */
const calculateLevel = (points) => {
  if (points >= LEVEL_THRESHOLDS.platinum) return "platinum";
  if (points >= LEVEL_THRESHOLDS.gold) return "gold";
  if (points >= LEVEL_THRESHOLDS.silver) return "silver";
  return "bronze";
};

/**
 * ----------------------------------------
 * SERVICE: TÌM HOẶC TẠO MỚI (findOrCreate)
 * ----------------------------------------
 * Đây là hàm nội bộ quan trọng, đảm bảo user luôn có 1 bản ghi thành viên.
 */
export const findOrCreateMembershipService = async (userId, transaction = null) => {
  const [membership] = await Memberships.findOrCreate({
    where: { user_id: userId },
    defaults: {
      points: 0,
      level: "bronze",
    },
    ...(transaction && { transaction }), // Thêm transaction nếu có
  });
  return membership;
};

/**
 * ----------------------------------------
 * SERVICE: LẤY DANH SÁCH THÀNH VIÊN (Admin)
 * ----------------------------------------
 */
export const getAllMembershipsService = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    level,
    sort = "points",
    order = "DESC",
  } = queryParams;
  const offset = (page - 1) * limit;
  const whereClause = {};

  if (level) whereClause.level = level;

  try {
    const { count, rows } = await Memberships.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Users,
          attributes: ["user_id", "email", "full_name"], // Lấy thông tin user
        },
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: offset,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      members: rows,
    };
  } catch (error) {
    throw new Error(`Không thể lấy danh sách thành viên: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY THÔNG TIN THÀNH VIÊN (CỦA 1 USER)
 * ----------------------------------------
 */
export const getMembershipByUserIdService = async (userId) => {
  try {
    // Dùng findOrCreate để nếu user mới chưa có sẽ tự tạo
    const membership = await findOrCreateMembership(userId);

    // Lấy lại thông tin (hoặc load) kèm User
    const result = await Memberships.findOne({
      where: { user_id: userId },
      include: [{ model: Users, attributes: ["email", "full_name"] }],
    });

    return result;
  } catch (error) {
    throw new Error(`Không thể lấy thông tin thành viên: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CỘNG/TRỪ ĐIỂM (Chức năng quan trọng nhất)
 * ----------------------------------------
 */
export const addPointsToUserService = async (userId, pointsToAdd) => {
  const t = await sequelize.transaction();
  try {
    // 1. Lấy hoặc tạo bản ghi (dùng transaction)
    const membership = await findOrCreateMembership(userId, t);

    // 2. Tính toán điểm mới (đảm bảo không âm)
    const newPoints = Math.max(0, membership.points + pointsToAdd);

    // 3. Tính toán hạng mới
    const newLevel = calculateLevel(newPoints);

    // 4. Cập nhật
    const updatedMembership = await membership.update(
      {
        points: newPoints,
        level: newLevel,
        updated_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    return updatedMembership;
  } catch (error) {
    await t.rollback();
    throw new Error(`Không thể cập nhật điểm: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT THỦ CÔNG (Admin)
 * ----------------------------------------
 */
export const updateMembershipDetailsService = async (userId, updateData) => {
  try {
    // 1. Lấy hoặc tạo
    const membership = await findOrCreateMembership(userId);

    const { points, level } = updateData;
    const dataToUpdate = { updated_at: new Date() };

    if (points !== undefined) {
      dataToUpdate.points = points;
      // Nếu admin set điểm, tự động tính lại level (trừ khi admin cũng set level)
      if (level === undefined) {
        dataToUpdate.level = calculateLevel(points);
      }
    }

    if (level !== undefined) {
      // Admin ghi đè level
      dataToUpdate.level = level;
    }

    // 2. Cập nhật
    const updatedMembership = await membership.update(dataToUpdate);
    return updatedMembership;
  } catch (error) {
    throw new Error(`Không thể cập nhật thành viên: ${error.message}`);
  }
};
