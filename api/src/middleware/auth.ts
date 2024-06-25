import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";
import logger from "../utils/logger";

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).send("Unauthorized");
    }
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (e) {
    logger.error("Error verifying token", e, req.headers.authorization);
    res.status(401).send("Unauthorized");
  }
}
