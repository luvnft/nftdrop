import { getProject, Project, updateProjectMintCount } from "../models/project";
import { getUserMint } from "../models/mint";
import { getUserData } from "../models/user";

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
    mintedAt: userMint.timestamp,
    primaryEthereumWallet: userData.primaryEthereumWallet,
  };
}

export async function updateMintCount(projectId: string, mintCount: number) {
  await updateProjectMintCount(projectId, mintCount);
}
