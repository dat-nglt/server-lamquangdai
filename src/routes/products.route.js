// GET /api/v1/products
// GET /api/v1/products/:id
import express from "express";
import productsController from "../controllers/products.controller.js";

const productsRouter = express.Router();

productsRouter.get("/", productsController.getAllProducts);
productsRouter.get("/:id", productsController.getProductById);

export default productsRouter;
