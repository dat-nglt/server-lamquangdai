import express from "express";
import {
  getAllServicesWithStaffController,
  getServiceDetailController,
  getServicesByTypeController,
} from "../controllers/services.controller.js";

const routeForService = express.Router();

routeForService.get("/", getAllServicesWithStaffController);
routeForService.get("/:id", getServiceDetailController);
routeForService.get("/type/:type", getServicesByTypeController);

export default routeForService;
