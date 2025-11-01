// src/services/categories.service.js

// Import các model cần thiết
import db from "../models/index.js";
const { Categories, Products } = db; // Cần Products để kiểm tra khi xoá

/**
 * ----------------------------------------
 * SERVICE: TẠO MỚI DANH MỤC
 * ----------------------------------------
 */
export const createCategoryService = async (categoryData) => {
  const { category_name, description, parent_id, status } = categoryData;

  try {
    // 1. Kiểm tra xem parent_id (nếu có) có hợp lệ không
    if (parent_id) {
      const parent = await Categories.findByPk(parent_id);
      if (!parent) {
        throw new Error("Danh mục cha không tồn tại.");
      }
    }

    // 2. Tạo danh mục mới
    const newCategory = await Categories.create({
      category_name,
      description,
      parent_id: parent_id || null, // Đảm bảo là NULL nếu không cung cấp
      status,
    });

    return newCategory;
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Tên danh mục đã tồn tại.");
    }
    // Ném lỗi (ví dụ: 'Danh mục cha không tồn tại')
    throw new Error(error.message);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY TẤT CẢ DANH MỤC (DẠNG CÂY)
 * ----------------------------------------
 */
export const getAllCategoriesAsTreeService = async () => {
  try {
    // 1. Lấy tất cả danh mục (dạng phẳng)
    const allCategories = await Categories.findAll({
      order: [["category_name", "ASC"]],
      // Chuyển đổi thành plain object để thêm thuộc tính 'subcategories'
      raw: true,
      nest: true,
    });

    // 2. Xây dựng cây
    const categoriesMap = new Map(); // Dùng Map để truy cập O(1)
    const tree = []; // Mảng chứa các danh mục gốc (cấp 1)

    // Khởi tạo map và thêm mảng 'subcategories' cho mỗi danh mục
    allCategories.forEach((category) => {
      category.subcategories = [];
      categoriesMap.set(category.category_id, category);
    });

    // Lặp lại để gắn danh mục con vào cha
    allCategories.forEach((category) => {
      if (category.parent_id) {
        const parent = categoriesMap.get(category.parent_id);
        if (parent) {
          parent.subcategories.push(category);
        }
      } else {
        // Nếu không có parent_id, đây là danh mục gốc
        tree.push(category);
      }
    });

    return tree;
  } catch (error) {
    throw new Error(`Không thể lấy danh sách danh mục: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY CHI TIẾT MỘT DANH MỤC
 * ----------------------------------------
 */
export const getCategoryByIdService = async (categoryId) => {
  try {
    // Lấy danh mục và bao gồm cả Cha (ParentCategory) và Con (Subcategories)
    const category = await Categories.findByPk(categoryId, {
      include: [
        {
          model: Categories,
          as: "ParentCategory",
        },
        {
          model: Categories,
          as: "Subcategories",
        },
      ],
    });
    return category; // Trả về null nếu không tìm thấy
  } catch (error) {
    throw new Error(`Không thể tìm danh mục: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT DANH MỤC
 * ----------------------------------------
 */
export const updateCategoryService = async (categoryId, updateData) => {
  const { category_name, description, parent_id, status } = updateData;

  try {
    const category = await Categories.findByPk(categoryId);
    if (!category) {
      return null; // Không tìm thấy
    }

    // 1. Kiểm tra ràng buộc: không thể tự làm cha của chính nó
    if (parent_id && parent_id === categoryId) {
      throw new Error("Danh mục không thể tự làm cha của chính nó.");
    }

    // 2. Kiểm tra xem parent_id (nếu có) có hợp lệ không
    if (parent_id) {
      const parent = await Categories.findByPk(parent_id);
      if (!parent) {
        throw new Error("Danh mục cha không tồn tại.");
      }
    }

    // 3. Cập nhật
    const updatedCategory = await category.update({
      category_name,
      description,
      parent_id: parent_id || null,
      status,
    });

    return updatedCategory;
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Tên danh mục đã tồn tại.");
    }
    // Ném các lỗi khác (từ bước 1 và 2)
    throw new Error(error.message);
  }
};

/**
 * ----------------------------------------
 * SERVICE: XOÁ DANH MỤC
 * ----------------------------------------
 */
export const deleteCategoryService = async (categoryId) => {
  try {
    // 1. Kiểm tra xem danh mục có tồn tại không
    const category = await Categories.findByPk(categoryId);
    if (!category) {
      return 0; // Không tìm thấy gì để xoá
    }

    // 2. Ràng buộc: Kiểm tra có danh mục con không
    const subcategoryCount = await Categories.count({
      where: { parent_id: categoryId },
    });
    if (subcategoryCount > 0) {
      throw new Error("Không thể xoá. Danh mục này có chứa danh mục con.");
    }

    // 3. Ràng buộc: Kiểm tra có sản phẩm không (Cần import model Products)
    const productCount = await Products.count({
      where: { category_id: categoryId },
    });
    if (productCount > 0) {
      throw new Error("Không thể xoá. Danh mục này có chứa sản phẩm.");
    }

    // 4. Nếu qua hết các bước kiểm tra, tiến hành xoá
    await category.destroy();

    return 1; // Xoá thành công 1 hàng
  } catch (error) {
    // Ném lỗi (từ bước 2 và 3)
    throw new Error(error.message);
  }
};
