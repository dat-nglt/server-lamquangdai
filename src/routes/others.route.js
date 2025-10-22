// GET /api/v1/articles
// GET /api/v1/articles/:slug_or_id
// GET /api/v1/promotions
// GET /api/v1/users/me/rewards-history [Cần xác thực]

import express from "express";
import othersController from "../controllers/others.controller.js";

const othersRouter = express.Router();

othersRouter.get("/articles", othersController.getAllArticles);
othersRouter.get("/articles/:slug_or_id", othersController.getArticleBySlugOrId);
othersRouter.get("/promotions", othersController.getAllPromotions);
othersRouter.get("/users/me/rewards-history", othersController.getUserRewardsHistory);

export default othersRouter;