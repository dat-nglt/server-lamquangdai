import express from "express";
import { handleZaloWebhook } from "../controllers/webhook.controller.js";

const routeForWebhook = express.Router();

routeForWebhook.post("/", handleZaloWebhook);

export default routeForWebhook;
