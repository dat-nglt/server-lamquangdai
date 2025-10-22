// POST /api/v1/orders
// GET /api/v1/orders
// GET /api/v1/orders/:id
import express from "express";
import ordersController from "../controllers/orders.controller.js";

const ordersRouter = express.Router();

ordersRouter.post("/", ordersController.createOrder);
ordersRouter.get("/", ordersController.getAllOrders);
ordersRouter.get("/:id", ordersController.getOrderById);

export default ordersRouter;
