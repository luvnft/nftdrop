import express from "express";
import { verifyToken } from "../middleware/auth";
import * as projectController from "../controllers/projectController";

const router = express.Router();

router.get("/", verifyToken, projectController.getProjects);
router.post("/", verifyToken, projectController.createProject);
router.get("/:projectId", projectController.getProject);
router.patch("/:projectId", verifyToken, projectController.updateProject);
router.get("/:projectId/canMint", verifyToken, projectController.canMint);
router.get(
  "/:projectId/airdropStatus",
  verifyToken,
  projectController.getAirdropStatus
);
router.post(
  "/:projectId/recordOnChain",
  verifyToken,
  projectController.recordOnChain
);
router.patch(
  "/:projectId/claimOpen",
  verifyToken,
  projectController.updateClaimOpen
);

export default router;
