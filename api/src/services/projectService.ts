import {
  getProject,
  Project,
  updateProjectMintCount,
  getProjectsForUser,
  addProject,
  updateProjectClaimOpen,
} from "../models/project";
import { getUserMint } from "../models/mint";
import { getUserData } from "../models/user";

export async function createProject(project: Project): Promise<Project> {
  return await addProject(project);
}

export async function getProjects(uid: string): Promise<Project[]> {
  return await getProjectsForUser(uid);
}

export async function getProjectInfo(
  projectId: string
): Promise<Project | null> {
  return await getProject(projectId);
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

export async function updateClaimOpen(projectId: string, claimOpen: boolean) {
  await updateProjectClaimOpen(projectId, claimOpen);
}

export async function updateMintCount(projectId: string, mintCount: number) {
  await updateProjectMintCount(projectId, mintCount);
}
