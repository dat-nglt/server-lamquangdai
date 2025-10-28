import express from "express";
import { getAllUserController } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/", getAllUserController);

export default userRouter;
