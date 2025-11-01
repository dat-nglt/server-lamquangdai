// src/services/articles.service.js

// Import model đã được khởi tạo từ file index của models
import db from "../models/index.js";
const { Articles } = db;

/**
 * ----------------------------------------
 * SERVICE CHO CHỨC NĂNG CREATE
 * ----------------------------------------
 */
export const createArticleService = async (articleData) => {
  // Dùng spread operator để chỉ lấy các trường cần thiết, tránh mass assignment
  const { title, content, image_url } = articleData;

  try {
    const newArticle = await Articles.create({
      title,
      content,
      image_url,
    });
    return newArticle;
  } catch (error) {
    // Ném lỗi để controller có thể bắt và xử lý
    throw new Error(`Không thể tạo bài viết: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE CHO CHỨC NĂNG READ ALL
 * ----------------------------------------
 */
export const getAllArticlesService = async () => {
  try {
    // Sắp xếp theo ngày tạo mới nhất
    const articles = await Articles.findAll({
      order: [["created_at", "DESC"]],
    });
    return articles;
  } catch (error) {
    throw new Error(`Không thể lấy danh sách bài viết: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE CHO CHỨC NĂNG READ ONE
 * ----------------------------------------
 */
export const getArticleByIdService = async (articleId) => {
  try {
    const article = await Articles.findByPk(articleId);

    // Tùy chọn: Tăng lượt xem mỗi khi gọi
    if (article) {
      await article.increment("views");
    }

    return article; // Trả về article (hoặc null nếu không tìm thấy)
  } catch (error) {
    throw new Error(`Không thể tìm bài viết: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE CHO CHỨC NĂNG UPDATE
 * ----------------------------------------
 */
export const updateArticleService = async (articleId, updateData) => {
  try {
    const article = await Articles.findByPk(articleId);

    if (!article) {
      return null; // Trả về null nếu không tìm thấy
    }

    // Chỉ lấy các trường được phép cập nhật
    const { title, content, image_url } = updateData;
    const updatedArticle = await article.update({
      title,
      content,
      image_url,
    });

    return updatedArticle;
  } catch (error) {
    throw new Error(`Không thể cập nhật bài viết: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE CHO CHỨC NĂNG DELETE
 * ----------------------------------------
 */
export const deleteArticleService = async (articleId) => {
  try {
    const deletedRowCount = await Articles.destroy({
      where: {
        article_id: articleId,
      },
    });

    // Trả về số lượng hàng đã bị xoá (0 hoặc 1)
    return deletedRowCount;
  } catch (error) {
    throw new Error(`Không thể xoá bài viết: ${error.message}`);
  }
};
