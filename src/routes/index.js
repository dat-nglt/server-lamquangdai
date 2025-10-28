import express from "express";
import newsRouter from "./news.routes.js";
import categoryRouter from "./category.routes.js";
import userRouter from "./user.routes.js";
import productsRouter from "./products.routes.js";

const mainRouter = (server) => {
  server.use("/user", userRouter);
  server.use("/product", productsRouter);
  server.use("/news", newsRouter);
  server.use("/category", categoryRouter);
};

export default mainRouter;
