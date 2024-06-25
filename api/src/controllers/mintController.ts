import { Request, Response } from "express";
import * as mintService from "../services/mintService";

export async function mintNFT(req: Request, res: Response) {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  try {
    const result = await mintService.mintNFT(projectId, req.user!.uid);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send((error as Error).message);
  }
}

export async function getUserNFTs(req: Request, res: Response) {
  const nfts = await mintService.getUserNFTs(req.user!.uid);
  res.send(nfts);
}
