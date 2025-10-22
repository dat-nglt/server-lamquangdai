import express from "express";
import productsRouter from "./products.route.js";
import categoriesRouter from "./categories.route.js";
import shoppingCartRouter from "./shopping-cart.route.js";
import ordersRouter from "./orders.route.js";
import othersRouter from "./others.route.js";

const mainRouter = express.Router();

mainRouter.use("/products", productsRouter);
mainRouter.use("/categories", categoriesRouter);
mainRouter.use("/cart", shoppingCartRouter);
mainRouter.use("/orders", ordersRouter);
mainRouter.use("/others", othersRouter);

export default mainRouter;