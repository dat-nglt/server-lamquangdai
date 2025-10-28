import express from "express";
import { getAllNewsController } from "../controllers/news.controller.js";

const newsRouter = express.Router();

newsRouter.get("/", getAllNewsController);

export default newsRouter;
