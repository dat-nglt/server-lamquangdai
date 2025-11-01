import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesAsTreeService,
  getCategoryByIdService,
  updateCategoryService,
} from "../services/category.service";

/**
 * ----------------------------------------
 * CONTROLLER: TẠO MỚI DANH MỤC
 * ----------------------------------------
 */
export const createCategoryController = async (req, res) => {
  try {
    // 1. Validate input
    const { category_name } = req.body;
    if (!category_name) {
      return res.status(400).json({
        message: "Tên danh mục (category_name) là bắt buộc",
      });
    }

    // 2. Gọi service
    const newCategory = await createCategoryService(req.body);

    // 3. Trả về kết quả
    res.status(201).json(newCategory);
  } catch (error) {
    // 4. Xử lý lỗi
    if (error.message.includes("Tên danh mục đã tồn tại")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    if (error.message.includes("Danh mục cha không tồn tại")) {
      return res.status(404).json({ message: error.message }); // 404 Not Found
    }
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY TẤT CẢ DANH MỤC (DẠNG CÂY)
 * ----------------------------------------
 */
export const getAllCategoriesController = async (req, res) => {
  try {
    const categoryTree = await getAllCategoriesAsTreeService();
    res.status(200).json(categoryTree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY CHI TIẾT MỘT DANH MỤC
 * ----------------------------------------
 */
export const getCategoryByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryByIdService(id);

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT DANH MỤC
 * ----------------------------------------
 */
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updatedCategory = await updateCategoryService(id, updateData);

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh mục để cập nhật" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    if (error.message.includes("Tên danh mục đã tồn tại")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    if (error.message.includes("Danh mục cha không tồn tại")) {
      return res.status(404).json({ message: error.message }); // 404 Not Found
    }
    if (error.message.includes("tự làm cha của chính nó")) {
      return res.status(400).json({ message: error.message }); // 400 Bad Request
    }
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: XOÁ DANH MỤC
 * ----------------------------------------
 */
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await deleteCategoryService(id);

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh mục để xoá" });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    // Xử lý các lỗi ràng buộc từ service
    if (
      error.message.includes("danh mục con") ||
      error.message.includes("sản phẩm")
    ) {
      return res.status(400).json({ message: error.message }); // 400 Bad Request
    }
    res.status(500).json({ message: error.message });
  }
};
