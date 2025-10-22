// GET /api/v1/cart
// POST /api/v1/cart/items
// PUT /api/v1/cart/items/:itemId
// DELETE /api/v1/cart/items/:itemId
import express from "express";
import shoppingCartController from "../controllers/shopping-cart.controller.js";

const shoppingCartRouter = express.Router();

shoppingCartRouter.get("/", shoppingCartController.getCart);
shoppingCartRouter.post("/items", shoppingCartController.addItemToCart);
shoppingCartRouter.put("/items/:itemId", shoppingCartController.updateCartItem);
shoppingCartRouter.delete("/items/:itemId", shoppingCartController.removeItemFromCart);

export default shoppingCartRouter;