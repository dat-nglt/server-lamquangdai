import express from "express";
import {
  getAllMessageByUserIdController,
  sentMessageForUserByIdController,
  getAllRecentlyMessageController,
  createChatSessionController,
} from "../controllers/chatbox.controller.js";
import { createChatSessionController } from "../controllers/gemeni.controller.js";

const routeForChatbox = express.Router();

routeForChatbox.get("/recently-message", getAllRecentlyMessageController);

routeForChatbox.get("/:id", getAllMessageByUserIdController);

routeForChatbox.post("/gemeni-chat", createChatSessionController);

routeForChatbox.post("/:id", sentMessageForUserByIdController);

export default routeForChatbox;
