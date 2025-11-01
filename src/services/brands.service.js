// src/services/brands.service.js

// Import model 'Brands' từ file index của models
import db from "../models/index.js";
const { Brands } = db;

/**
 * ----------------------------------------
 * SERVICE: TẠO MỚI THƯƠNG HIỆU
 * ----------------------------------------
 */
export const createBrandService = async (brandData) => {
  const { brand_name, description, logo_url } = brandData;

  try {
    const newBrand = await Brands.create({
      brand_name,
      description,
      logo_url,
    });
    return newBrand;
  } catch (error) {
    // Xử lý lỗi, đặc biệt là lỗi unique constraint
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Tên thương hiệu đã tồn tại.");
    }
    throw new Error(`Không thể tạo thương hiệu: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY TẤT CẢ THƯƠNG HIỆU
 * ----------------------------------------
 */
export const getAllBrandsService = async () => {
  try {
    // Sắp xếp theo tên A-Z
    const brands = await Brands.findAll({
      order: [["brand_name", "ASC"]],
    });
    return brands;
  } catch (error) {
    throw new Error(`Không thể lấy danh sách thương hiệu: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY CHI TIẾT MỘT THƯƠNG HIỆU
 * ----------------------------------------
 */
export const getBrandByIdService = async (brandId) => {
  try {
    const brand = await Brands.findByPk(brandId);
    return brand; // Trả về brand (hoặc null nếu không tìm thấy)
  } catch (error) {
    throw new Error(`Không thể tìm thương hiệu: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT THƯƠNG HIỆU
 * ----------------------------------------
 */
export const updateBrandService = async (brandId, updateData) => {
  try {
    const brand = await Brands.findByPk(brandId);

    if (!brand) {
      return null; // Không tìm thấy thương hiệu để cập nhật
    }

    // Chỉ lấy các trường được phép cập nhật
    const { brand_name, description, logo_url } = updateData;

    // Cập nhật các trường nếu chúng được cung cấp
    brand.brand_name = brand_name ?? brand.brand_name;
    brand.description = description ?? brand.description;
    brand.logo_url = logo_url ?? brand.logo_url;

    await brand.save(); // Lưu thay đổi

    return brand;
  } catch (error) {
    // Xử lý lỗi, đặc biệt là lỗi unique constraint
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Tên thương hiệu đã tồn tại.");
    }
    throw new Error(`Không thể cập nhật thương hiệu: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: XOÁ THƯƠNG HIỆU
 * ----------------------------------------
 */
export const deleteBrandService = async (brandId) => {
  try {
    const deletedRowCount = await Brands.destroy({
      where: {
        brand_id: brandId,
      },
    });

    return deletedRowCount; // Trả về 0 hoặc 1
  } catch (error) {
    // Xử lý lỗi nếu có liên quan (ví dụ: khoá ngoại)
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new Error("Không thể xoá thương hiệu vì có sản phẩm liên quan.");
    }
    throw new Error(`Không thể xoá thương hiệu: ${error.message}`);
  }
};
