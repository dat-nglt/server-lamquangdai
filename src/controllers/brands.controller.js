// src/controllers/brands.controller.js

import { createBrandService, deleteBrandService, getAllBrandsService, getBrandByIdService, updateBrandService } from "../services/brands.service";

/**
 * ----------------------------------------
 * CONTROLLER: TẠO MỚI THƯƠNG HIỆU
 * ----------------------------------------
 */
export const createBrandController = async (req, res) => {
  try {
    // 1. Validate input
    const { brand_name } = req.body;
    if (!brand_name) {
      return res.status(400).json({
        message: "Tên thương hiệu (brand_name) là bắt buộc",
      });
    }

    // 2. Gọi service
    const newBrand = await createBrandService(req.body);

    // 3. Trả về kết quả
    res.status(201).json(newBrand);
  } catch (error) {
    // 4. Xử lý lỗi
    // Lỗi "Tên thương hiệu đã tồn tại" từ service
    if (error.message.includes("Tên thương hiệu đã tồn tại")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY TẤT CẢ THƯƠNG HIỆU
 * ----------------------------------------
 */
export const getAllBrandsController = async (req, res) => {
  try {
    const brands = await getAllBrandsService();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY CHI TIẾT MỘT THƯƠNG HIỆU
 * ----------------------------------------
 */
export const getBrandByIdController = async (req, res) => {
  try {
    const { id } = req.params; // Lấy brand_id từ URL
    const brand = await getBrandByIdService(id);

    if (!brand) {
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
    }

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT THƯƠNG HIỆU
 * ----------------------------------------
 */
export const updateBrandController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updatedBrand = await updateBrandService(id, updateData);

    if (!updatedBrand) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thương hiệu để cập nhật" });
    }

    res.status(200).json(updatedBrand);
  } catch (error) {
    // Lỗi "Tên thương hiệu đã tồn tại" từ service
    if (error.message.includes("Tên thương hiệu đã tồn tại")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: XOÁ THƯƠNG HIỆU
 * ----------------------------------------
 */
export const deleteBrandController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await deleteBrandService(id);

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thương hiệu để xoá" });
    }

    // Xoá thành công, không cần trả về nội dung
    res.status(204).send();
  } catch (error) {
    // Lỗi khoá ngoại từ service
    if (error.message.includes("sản phẩm liên quan")) {
      return res.status(400).json({ message: error.message }); // 400 Bad Request
    }
    res.status(500).json({ message: error.message });
  }
};
