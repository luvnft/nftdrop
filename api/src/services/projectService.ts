import {
  getProject,
  Project,
  updateProjectMintCount,
  getProjectsForUser,
  addProject,
  updateProjectClaimOpen,
  updateProjectOnchain,
} from "../models/project";
import { getUserMint } from "../models/mint";
import { getUserData } from "../models/user";
import {
  recordProjectOnChain,
  doesProjectExistOnChain,
} from "../blockchain/base";

export async function createProject(project: Project): Promise<Project> {
  return await addProject(project);
}

export async function getProjects(uid: string): Promise<Project[]> {
  const projects = await getProjectsForUser(uid);
  const projectInfoPromises = projects.map(async (project) => {
    const projectExistsOnChain = project.id
      ? await doesProjectExistOnChain(project.id)
      : false;
    return { ...project, existsOnChain: projectExistsOnChain };
  });
  const projectInfoList = await Promise.all(projectInfoPromises);
  return projectInfoList;
}

export async function getProjectInfo(
  projectId: string
): Promise<Project | null> {
  return getProject(projectId);
}

export async function canUserMint(projectId: string, uid: string) {
  const [userData, userMint] = await Promise.all([
    getUserData(uid),
    getUserMint(projectId, uid),
  ]);

  if (!userMint) {
    return {
      userAlreadyMinted: false,
      primaryEthereumWallet: userData.primaryEthereumWallet,
    };
  }

  return {
    userAlreadyMinted: true,
    mintedAt: userMint.timestamp.toDate().toISOString(),
    primaryEthereumWallet: userData.primaryEthereumWallet,
  };
}

export async function createProjectOnChain(projectId: string) {
  const transactionResult = await recordProjectOnChain(projectId);
  if (!transactionResult.success) {
    throw new Error("Failed to record project on blockchain");
  }
  await updateProjectOnchain(projectId, transactionResult.transactionHash);
  return { txHash: transactionResult.transactionHash };
}

export async function updateClaimOpen(projectId: string, claimOpen: boolean) {
  if (claimOpen) {
    const projectExistsOnChain = doesProjectExistOnChain(projectId);
    if (!projectExistsOnChain) {
      throw new Error("Project does not exist on chain");
    }
  }

  return updateProjectClaimOpen(projectId, claimOpen);
}

export async function updateMintCount(projectId: string, mintCount: number) {
  return updateProjectMintCount(projectId, mintCount);
}
