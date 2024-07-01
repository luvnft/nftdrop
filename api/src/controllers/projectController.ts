import { Request, Response } from "express";
import * as projectService from "../services/projectService";

export async function createProject(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  const {
    title,
    from,
    description,
    image,
    nftContractAddress,
    tokenId,
    network,
    trackerContractVersion,
    trackerContractAddress,
  } = req.body;

  if (
    !title ||
    !from ||
    !description ||
    !image ||
    !nftContractAddress ||
    !tokenId ||
    !network ||
    !trackerContractVersion ||
    !trackerContractAddress
  ) {
    return res.status(400).send("Missing required fields");
  }

  const project = await projectService.createProject({
    title,
    from,
    description,
    image,
    nftContractAddress,
    tokenId,
    uid: req.user.uid,
    claimOpen: false,
    claimLimit: 100,
    network,
    trackerContractVersion,
    trackerContractAddress,
  });

  res.send(project);
}

export async function updateProject(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  const {
    title,
    from,
    description,
    image,
    nftContractAddress,
    tokenId,
    network,
    trackerContractVersion,
    trackerContractAddress,
  } = req.body;

  if (
    !title ||
    !from ||
    !description ||
    !image ||
    !nftContractAddress ||
    !tokenId ||
    !network ||
    !trackerContractVersion ||
    !trackerContractAddress
  ) {
    return res.status(400).send("Missing required fields");
  }

  const project = await projectService.updateProject(projectId, {
    title,
    from,
    description,
    image,
    nftContractAddress,
    tokenId,
    network,
    trackerContractVersion,
    trackerContractAddress,
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

export async function getAirdropStatus(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  const { updateOnChain } = req.query;

  const project = await projectService.getAirdropStatus(
    projectId,
    updateOnChain === "true"
  );

  if (!project) {
    return res.status(404).send("Project not found");
  }

  res.send(project);
}

export async function recordOnChain(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  const data = await projectService.createProjectOnChain(projectId);
  res.status(200).send(data);
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
  res.status(200).send();
}

export async function canMint(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).send("projectId is required");
  }

  const result = await projectService.canUserMint(projectId, req.user!.uid);
  res.send(result);
}
