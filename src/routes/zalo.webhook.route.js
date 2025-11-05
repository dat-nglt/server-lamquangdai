import express from "express";
import { webhookController } from "../controllers/webhook.controller";

const routeForWebhook = express.Router();

routeForWebhook.arguments("/", webhookController);

export default routeForWebhook;
