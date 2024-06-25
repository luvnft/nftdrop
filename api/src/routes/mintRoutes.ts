import express from "express";
import { verifyToken } from "../middleware/auth";
import * as mintController from "../controllers/mintController";

const router = express.Router();

router.post("/", verifyToken, mintController.mintNFT);
router.get("/", verifyToken, mintController.getUserNFTs);

export default router;
