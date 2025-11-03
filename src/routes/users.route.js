// src/routes/users.route.js
import { Router } from "express";
import {
  getMyProfileController,
  updateMyProfileController,
  getAllUsersController,
  getUserByIdController,
  updateUserByAdminController,
  deleteUserByAdminController,
} from "../controllers/users.controller.js";
import { checkAuth, checkAdmin } from "../middlewares/auth.middleware.js";

const routeForUser = Router();

// --- Các route cho User (đã đăng nhập) ---
routeForUser.get("/me", checkAuth, getMyProfileController);
routeForUser.put("/me", checkAuth, updateMyProfileController);

// --- Các route cho Admin (yêu cầu checkAuth và checkAdmin) ---
routeForUser.get("/", checkAuth, checkAdmin, getAllUsersController);
routeForUser.get("/:id", checkAuth, checkAdmin, getUserByIdController);
routeForUser.put("/:id", checkAuth, checkAdmin, updateUserByAdminController);
routeForUser.delete("/:id", checkAuth, checkAdmin, deleteUserByAdminController);

export default routeForUser;
