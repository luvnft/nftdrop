import express from "express";
import { verifyToken } from "../middleware/auth";
import * as projectController from "../controllers/projectController";

const router = express.Router();

router.get("/:projectId", projectController.getProject);
router.get("/:projectId/canMint", verifyToken, projectController.canMint);

export default router;
