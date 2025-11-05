import express from "express";
import { webhookController } from "../controllers/webhook.controller.js";

const routeForWebhook = express.Router();

routeForWebhook.get("/", webhookController);
routeForWebhook.post("/", webhookController);

export default routeForWebhook;
