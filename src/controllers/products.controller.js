import { createProductService, deleteProductService, getAllProductsService, getProductByIdService, updateProductService } from "../services/product.service.js";

/**
 * ----------------------------------------
 * CONTROLLER: TẠO MỚI SẢN PHẨM
 * ----------------------------------------
 */
export const createProductController = async (req, res) => {
  try {
    // 1. Validate input cơ bản
    const { product_name, brand_id, category_id, price } = req.body;
    if (!product_name || !brand_id || !category_id || !price) {
      return res.status(400).json({
        message: "product_name, brand_id, category_id, và price là bắt buộc",
      });
    }

    // 2. Gọi service
    const newProduct = await createProductService(req.body);

    // 3. Trả về kết quả
    res.status(201).json(newProduct);
  } catch (error) {
    // 4. Xử lý lỗi (ví dụ: brand/category không tồn tại)
    if (error.message.includes("không tồn tại")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY DANH SÁCH SẢN PHẨM (Lọc/Phân trang)
 * ----------------------------------------
 */
export const getAllProductsController = async (req, res) => {
  try {
    // Toàn bộ query params (page, limit, sort, q,...) được truyền vào service
    const result = await getAllProductsService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY CHI TIẾT SẢN PHẨM
 * ----------------------------------------
 */
export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT SẢN PHẨM
 * ----------------------------------------
 */
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updatedProduct = await updateProductService(id, updateData);

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    // Xử lý lỗi (ví dụ: brand/category không tồn tại)
    if (error.message.includes("không tồn tại")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: XOÁ SẢN PHẨM
 * ----------------------------------------
 */
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await deleteProductService(id);

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để xoá" });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    // Xử lý lỗi ràng buộc (từ service)
    if (error.message.includes("trong đơn hàng")) {
      return res.status(400).json({ message: error.message }); // 400 Bad Request
    }
    res.status(500).json({ message: error.message });
  }
};
