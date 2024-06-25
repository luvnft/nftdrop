import { Request, Response } from "express";
import * as projectService from "../services/projectService";

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

export async function canMint(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  const result = await projectService.canUserMint(projectId, req.user!.uid);
  res.send(result);
}
