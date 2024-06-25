import { Timestamp } from "firebase-admin/firestore";
import {
  createMint,
  getProjectMintCount,
  getUserMints,
  Mint,
} from "../models/mint";
import { getProject } from "../models/project";
import { getUserData } from "../models/user";
import { updateMintCount } from "./projectService";

export async function mintNFT(
  projectId: string,
  uid: string
): Promise<{ mintId: string; mintCount: number; mint: Mint }> {
  const [project, userData] = await Promise.all([
    getProject(projectId),
    getUserData(uid),
  ]);

  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.claimOpen) {
    throw new Error("Claiming is not open for this project");
  }

  const mintData: Mint = {
    projectId,
    uid,
    from: project.from,
    title: project.title,
    description: project.description,
    image: project.image,
    nftLink: project.nftLink,
    timestamp: Timestamp.fromDate(new Date()),
    walletAddress: userData.primaryEthereumWallet ?? null,
    airdroppedAt: null,
  };

  const mintId = await createMint(mintData);
  const mintCount = await getProjectMintCount(projectId);
  await updateMintCount(projectId, mintCount);

  return { mintId, mintCount, mint: mintData };
}

export async function getUserNFTs(uid: string): Promise<Mint[]> {
  return await getUserMints(uid);
}
