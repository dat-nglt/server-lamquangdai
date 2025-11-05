import express from "express";
import { webhookController } from "../controllers/webhook.controller.js";

const routeForWebhook = express.Router();

routeForWebhook.get("/", webhookController);

export default routeForWebhook;
