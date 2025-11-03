import express from "express";

// 1. Import các controller functions
import {
  createArticleController,
  getAllArticlesController,
  getArticleByIdController,
  updateArticleController,
  deleteArticleController,
} from "../controllers/articles.controller.js"; // (Giả định đường dẫn)

// 2. Khởi tạo router
const routeForArticle = express.Router();

// 3. Định nghĩa các routes

// @route POST /api/articles
// @desc Tạo bài viết mới
routeForArticle.post("/", createArticleController);

// @route GET /api/articles
// @desc Lấy tất cả bài viết
routeForArticle.get("/", getAllArticlesController);

// @route GET /api/articles/:id
// @desc Lấy chi tiết một bài viết
routeForArticle.get("/:id", getArticleByIdController);

// @route PUT /api/articles/:id
// @desc Cập nhật một bài viết
routeForArticle.put("/:id", updateArticleController);

// @route DELETE /api/articles/:id
// @desc Xoá một bài viết
routeForArticle.delete("/:id", );
deleteArticleController
// 4. Export router
export default routeForArticle;
