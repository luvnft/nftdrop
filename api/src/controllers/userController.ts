import { Request, Response } from "express";
import * as userService from "../services/userService";

export async function getUserInfo(req: Request, res: Response) {
  const user = await userService.getUserInfo(req.user!.uid);
  res.send(user);
}

export async function updateUserWallet(req: Request, res: Response) {
  const { primaryEthereumWallet } = req.body;

  if (!primaryEthereumWallet) {
    return res.status(400).send("primaryEthereumWallet is required");
  }

  try {
    await userService.updateUserWallet(req.user!.uid, primaryEthereumWallet);
    res.send("ok");
  } catch (e) {
    res.status(500).send("Error setting wallet");
  }
}
