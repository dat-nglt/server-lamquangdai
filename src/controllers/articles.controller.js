// src/controllers/articles.controller.js

// Import tất cả các hàm từ service
import {
  createArticleService,
  deleteArticleService,
  getAllArticlesService,
  getArticleByIdService,
  updateArticleService,
} from "../services/article.service.js";

/**
 * ----------------------------------------
 * CONTROLLER CHO CHỨC NĂNG CREATE
 * ----------------------------------------
 */
export const createArticleController = async (req, res) => {
  try {
    // 1. Validate input
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        message: "Tiêu đề (title) và nội dung (content) là bắt buộc",
      });
    }

    // 2. Gọi service để tạo
    const newArticle = await createArticleService(req.body);

    // 3. Trả về kết quả
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER CHO CHỨC NĂNG READ ALL
 * ----------------------------------------
 */
export const getAllArticlesController = async (req, res) => {
  try {
    const articles = await getAllArticlesService();
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER CHO CHỨC NĂNG READ ONE
 * ----------------------------------------
 */
export const getArticleByIdController = async (req, res) => {
  try {
    const { id } = req.params; // Lấy article_id từ URL
    const article = await getArticleByIdService(id);

    if (!article) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER CHO CHỨC NĂNG UPDATE
 * ----------------------------------------
 */
export const updateArticleController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Kiểm tra xem có dữ liệu để cập nhật không
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updatedArticle = await updateArticleService(id, updateData);

    if (!updatedArticle) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài viết để cập nhật" });
    }

    res.status(200).json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER CHO CHỨC NĂNG DELETE
 * ----------------------------------------
 */
export const deleteArticleController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await deleteArticleService(id);

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài viết để xoá" });
    }

    // Tiêu chuẩn cho DELETE thành công là trả về status 204 (No Content)
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
