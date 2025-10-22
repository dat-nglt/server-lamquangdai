// GET /api/v1/categories
import express from "express";
import categoriesController from "../controllers/categories.controller.js";

const categoriesRouter = express.Router();

categoriesRouter.get("/", categoriesController.getAllCategories);
categoriesRouter.get("/:id", categoriesController.getCategoryById);

export default categoriesRouter;