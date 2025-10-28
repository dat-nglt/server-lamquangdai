import express from "express";
import { getAllProductController } from "../controllers/products.controller.js";

const productsRouter = express.Router();

productsRouter.get("/", getAllProductController);

export default productsRouter;
