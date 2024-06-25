import express from "express";
import { verifyToken } from "../middleware/auth";
import * as userController from "../controllers/userController";

const router = express.Router();

router.get("/", verifyToken, userController.getUserInfo);
router.post("/wallet", verifyToken, userController.updateUserWallet);

export default router;
