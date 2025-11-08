import express from "express";
import {
  getAllMessageByUserIdController,
  sentMessageForUserByIdController,
  getAllRecentlyMessageController,
} from "../controllers/chatbox.controller";

const routeForChatbox = express.Router();

routeForChatbox.get("/recently-message", getAllRecentlyMessageController);

routeForChatbox.get("/:id", getAllMessageByUserIdController);

routeForChatbox.post("/:id", sentMessageForUserByIdController);

export default routeForChatbox;
