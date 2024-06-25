import { Request, Response } from "express";
import * as projectService from "../services/projectService";
import logger from "../utils/logger";

export async function createProject(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  const { title, from, description, image, nftLink } = req.body;

  if (!title || !from || !description || !image || !nftLink) {
    return res.status(400).send("Missing required fields");
  }

  const project = await projectService.createProject({
    title,
    from,
    description,
    image,
    nftLink,
    uid: req.user.uid,
    claimOpen: false,
  });

  res.send(project);
}

export async function getProjects(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  const project = await projectService.getProjects(req.user.uid);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  res.send(project);
}

export async function getProject(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  const project = await projectService.getProjectInfo(projectId);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  res.send(project);
}

export async function updateClaimOpen(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  const { claimOpen } = req.body;

  if (typeof claimOpen !== "boolean") {
    return res.status(400).send("claimOpen is required");
  }

  await projectService.updateClaimOpen(projectId, claimOpen);
  res.send("Claim open updated");
}

export async function canMint(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  const result = await projectService.canUserMint(projectId, req.user!.uid);
  res.send(result);
}
