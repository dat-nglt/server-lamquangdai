import express from "express";
import { getAllCategoryController } from "../controllers/category.controller.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategoryController);

export default categoryRouter;
