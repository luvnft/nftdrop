import express from "express";
import { verifyToken } from "../middleware/auth";
import * as projectController from "../controllers/projectController";

const router = express.Router();

router.get("/", verifyToken, projectController.getProjects);
router.post("/", verifyToken, projectController.createProject);
router.get("/:projectId", projectController.getProject);
router.post(
  "/:projectId/recordOnchain",
  verifyToken,
  projectController.recordOnChain
);
router.patch(
  "/:projectId/claimOpen",
  verifyToken,
  projectController.updateClaimOpen
);
router.get("/:projectId/canMint", verifyToken, projectController.canMint);

export default router;
