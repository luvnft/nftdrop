import * as model from "../models/project";
import { getUserMint } from "../models/mint";
import { getUserData } from "../models/user";
import {
  recordProjectOnChain,
  doesProjectExistOnChain,
  getEligibleUsersForAirdrop,
  updateEligibleUsersForAirdrop,
} from "../blockchain/base";
import logger from "../utils/logger";
import { Timestamp } from "firebase-admin/firestore";

export async function createProject(
  project: model.Project
): Promise<model.Project> {
  return await model.addProject(project);
}

export async function updateProject(projectId: string, data: any) {
  return await model.updateProject(projectId, data);
}

function formatProject(project: model.Project) {
  return {
    ...project,
    latestClaimAt: project.latestClaimAt?.toDate().toISOString(),
    lastUpdatedOnChainAt: project.lastUpdatedOnChainAt?.toDate().toISOString(),
    eligibleAddressesLastUpdatedAt: project.eligibleAddressesLastUpdatedAt
      ?.toDate()
      .toISOString(),
  };
}

export async function getProjects(uid: string): Promise<any[]> {
  const projects = await model.getProjectsForUser(uid);
  const projectInfoPromises = projects.map(async (project) => {
    const projectExistsOnChain = project.id
      ? await doesProjectExistOnChain(project.id)
      : false;
    return { ...project, existsOnChain: projectExistsOnChain };
  });
  const projectInfoList = await Promise.all(projectInfoPromises);
  return projectInfoList.map((project) => {
    return formatProject(project);
  });
}

export async function getProjectInfo(
  projectId: string
): Promise<model.Project | null> {
  return model.getProject(projectId);
}

export async function canUserMint(projectId: string, uid: string) {
  const [userData, userMint] = await Promise.all([
    getUserData(uid),
    getUserMint(projectId, uid),
  ]);

  if (!userMint) {
    return {
      userAlreadyMinted: false,
      airdropWalletAddress: userData.airdropWalletAddress,
    };
  }

  return {
    userAlreadyMinted: true,
    claimedAt: userMint.timestamp.toDate().toISOString(),
    airdropWalletAddress: userData.airdropWalletAddress,
  };
}

export async function getAirdropStatus(
  projectId: string,
  updateOnChain: boolean
) {
  const project = await model.getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (updateOnChain) {
    const projectExistsOnChain = await doesProjectExistOnChain(projectId);
    if (!projectExistsOnChain) {
      logger.error("Project does not exist on chain", projectId, project);
      throw new Error("Project does not exist on chain");
    }
    const txResult = await updateEligibleUsersForAirdrop(projectId);
    if (!txResult.success) {
      logger.error(
        "Failed to update eligible users for airdrop on chain",
        txResult
      );
      throw new Error("Failed to update eligible users for airdrop on chain");
    }
    const lastUpdatedOnChainAt = new Date();
    await updateProject(projectId, { lastUpdatedOnChainAt });
    project.lastUpdatedOnChainAt = Timestamp.fromDate(lastUpdatedOnChainAt);
  }

  const eligibleAddresses = await getEligibleUsersForAirdrop(projectId);
  const eligibleAddressesLastUpdatedAt = Timestamp.now();

  logger.info(eligibleAddresses);
  const waitingForAirdropCount = eligibleAddresses.length;

  await updateProject(projectId, {
    waitingForAirdropCount,
    eligibleAddresses,
    eligibleAddressesLastUpdatedAt,
  });

  project.eligibleAddressesLastUpdatedAt = eligibleAddressesLastUpdatedAt;

  return {
    ...formatProject(project),
    eligibleAddresses,
    waitingForAirdropCount,
  };
}

export async function createProjectOnChain(projectId: string) {
  const project = await model.getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const { nftContractAddress, tokenId } = project;

  if (!nftContractAddress || !tokenId) {
    throw new Error("Project is missing required fields");
  }

  const transactionResult = await recordProjectOnChain(
    projectId,
    nftContractAddress,
    tokenId
  );
  if (!transactionResult.success) {
    throw new Error("Failed to record project on blockchain");
  }
  await model.updateProjectOnchain(
    projectId,
    transactionResult.transactionHash
  );
  return { txHash: transactionResult.transactionHash };
}

export async function updateClaimOpen(projectId: string, claimOpen: boolean) {
  if (claimOpen) {
    const projectExistsOnChain = doesProjectExistOnChain(projectId);
    if (!projectExistsOnChain) {
      throw new Error("Project does not exist on chain");
    }
  }

  return model.updateProjectClaimOpen(projectId, claimOpen);
}

export async function updateMintCount(projectId: string, mintCount: number) {
  return model.updateProjectMintCount(projectId, mintCount);
}
