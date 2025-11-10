import express from "express";
import {
  getAllMessageByUserIdController,
  sentMessageForUserByIdController,
  getAllRecentlyMessageController,
} from "../controllers/chatbox.controller.js";
import { createChatSessionController } from "../controllers/gemeniController.js";

const routeForChatbox = express.Router();

routeForChatbox.get("/recently-message", getAllRecentlyMessageController);

routeForChatbox.get("/:id", getAllMessageByUserIdController);

routeForChatbox.post("/:id", sentMessageForUserByIdController);

routeForChatbox.post("/gemeni-chat", createChatSessionController);

export default routeForChatbox;
