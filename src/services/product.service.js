// src/services/products.service.js

import { Op } from "sequelize"; // Import Operators
import db from "../models/index.js";

// Import tất cả model cần thiết
const { Products, Brands, Categories, OrderDetails } = db;

/**
 * ----------------------------------------
 * SERVICE: TẠO MỚI SẢN PHẨM
 * ----------------------------------------
 */
export const createProductService = async (productData) => {
  const {
    product_name,
    brand_id,
    category_id,
    price,
    description,
    image_url,
    specifications,
    status,
  } = productData;

  try {
    // 1. Kiểm tra sự tồn tại của Brand và Category (Ràng buộc logic)
    const brand = await Brands.findByPk(brand_id);
    if (!brand) {
      throw new Error("Thương hiệu (brand_id) không tồn tại.");
    }

    const category = await Categories.findByPk(category_id);
    if (!category) {
      throw new Error("Danh mục (category_id) không tồn tại.");
    }

    // 2. Tạo sản phẩm
    const newProduct = await Products.create({
      product_name,
      brand_id,
      category_id,
      price,
      description,
      image_url,
      specifications: specifications || {},
      status: status || "active",
    });

    return newProduct;
  } catch (error) {
    // Ném lỗi (bao gồm cả lỗi từ bước 1)
    throw new Error(`Không thể tạo sản phẩm: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY DANH SÁCH SẢN PHẨM (Nâng cao)
 * (Hỗ trợ lọc, phân trang, sắp xếp)
 * ----------------------------------------
 */
export const getAllProductsService = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = "created_at",
    order = "DESC",
    brand_id,
    category_id,
    status,
    q, // 'q' là query string để tìm kiếm theo tên
  } = queryParams;

  try {
    // 1. Tính toán offset cho phân trang
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // 2. Xây dựng điều kiện 'where' (lọc)
    const whereClause = {};
    if (brand_id) whereClause.brand_id = brand_id;
    if (category_id) whereClause.category_id = category_id;
    if (status) whereClause.status = status;
    if (q) {
      // Tìm kiếm không phân biệt hoa thường
      whereClause.product_name = { [Op.iLike]: `%${q}%` };
    }

    // 3. Xây dựng điều kiện 'include' (liên kết bảng)
    // Chỉ lấy các trường cần thiết từ Brand và Category
    const includeClause = [
      {
        model: Brands,
        attributes: ["brand_id", "brand_name", "logo_url"],
      },
      {
        model: Categories,
        attributes: ["category_id", "category_name"],
      },
    ];

    // 4. Thực hiện truy vấn với findAndCountAll để phân trang
    const { count, rows } = await Products.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [[sort, order]],
      limit: parseInt(limit, 10),
      offset: offset,
    });

    // 5. Trả về kết quả có cấu trúc
    return {
      totalItems: count,
      totalPages: Math.ceil(count / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      products: rows,
    };
  } catch (error) {
    throw new Error(`Không thể lấy danh sách sản phẩm: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY CHI TIẾT SẢN PHẨM
 * ----------------------------------------
 */
export const getProductByIdService = async (productId) => {
  try {
    const product = await Products.findByPk(productId, {
      // Include đầy đủ thông tin của Brand và Category
      include: [{ model: Brands }, { model: Categories }],
    });
    return product; // Trả về null nếu không tìm thấy
  } catch (error) {
    throw new Error(`Không thể tìm sản phẩm: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT SẢN PHẨM
 * ----------------------------------------
 */
export const updateProductService = async (productId, updateData) => {
  try {
    const product = await Products.findByPk(productId);
    if (!product) {
      return null; // Không tìm thấy
    }

    const { brand_id, category_id } = updateData;

    // 1. Kiểm tra brand_id mới (nếu có)
    if (brand_id) {
      const brand = await Brands.findByPk(brand_id);
      if (!brand) throw new Error("Thương hiệu (brand_id) không tồn tại.");
    }

    // 2. Kiểm tra category_id mới (nếu có)
    if (category_id) {
      const category = await Categories.findByPk(category_id);
      if (!category) throw new Error("Danh mục (category_id) không tồn tại.");
    }

    // 3. Cập nhật (Sequelize chỉ cập nhật các trường có trong updateData)
    const updatedProduct = await product.update(updateData);

    return updatedProduct;
  } catch (error) {
    throw new Error(`Không thể cập nhật sản phẩm: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: XOÁ SẢN PHẨM
 * ----------------------------------------
 */
export const deleteProductService = async (productId) => {
  try {
    // 1. Ràng buộc nghiệp vụ: Kiểm tra sản phẩm có trong đơn hàng nào không
    // (Giả sử bạn có model OrderDetails như trong 'associate')
    const orderCount = await OrderDetails.count({
      where: { product_id: productId },
    });

    if (orderCount > 0) {
      throw new Error("Không thể xoá. Sản phẩm này đã tồn tại trong đơn hàng.");
    }

    // (Tuỳ chọn: Bạn cũng có thể xoá sản phẩm khỏi Cart, nhưng đơn hàng là quan trọng nhất)

    // 2. Tiến hành xoá
    const deletedRowCount = await Products.destroy({
      where: { product_id: productId },
    });

    return deletedRowCount; // 0 hoặc 1
  } catch (error) {
    throw new Error(error.message); // Ném lỗi từ bước 1
  }
};
