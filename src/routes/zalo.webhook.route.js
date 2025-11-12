import express from "express";
import { webhookController } from "../controllers/webhook.controller.js";

const routeForWebhook = express.Router();

routeForWebhook.post("/", webhookController);

export default routeForWebhook;
