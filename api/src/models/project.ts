import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";

export interface Project {
  id?: string;
  title: string;
  from: string;
  description: string;
  image: string;
  nftContractAddress: string;
  tokenId: string;
  uid: string;
  claimOpen: boolean;
  mintCount?: number;
  existsOnChain?: boolean;
  txHash?: string;
  latestClaimAt?: Timestamp;
  lastUpdatedOnChainAt?: Timestamp;
  waitingForAirdropCount?: number;
  eligibleAddresses?: string[];
  eligibleAddressesLastUpdatedAt?: Timestamp;
}

export async function addProject(project: Project) {
  const newProject = await firestore.collection("projects").add({
    ...project,
    mintCount: 0,
  });
  return {
    ...project,
    id: newProject.id,
  };
}

export async function getProjectsForUser(uid: string): Promise<Project[]> {
  const projects = await firestore
    .collection("projects")
    .where("uid", "==", uid)
    .get();
  return projects.docs.map(
    (project) => ({ ...project.data(), id: project.id } as Project)
  );
}

export async function getProject(projectId: string): Promise<Project | null> {
  const project = await firestore.doc(`projects/${projectId}`).get();
  return project.exists ? (project.data() as Project) : null;
}

export async function updateProjectOnchain(projectId: string, txHash: string) {
  await firestore
    .doc(`projects/${projectId}`)
    .update({ txHash, existsOnChain: true });
}

// Remember to check that the project exists on chain before setting claimOpen to true
export async function updateProjectClaimOpen(
  projectId: string,
  claimOpen: boolean
) {
  const setValues: any = { claimOpen };
  if (claimOpen) {
    setValues.existsOnChain = true;
  }
  await firestore.doc(`projects/${projectId}`).update({ claimOpen });
}

export async function updateProjectMintCount(
  projectId: string,
  mintCount: number
) {
  await firestore.doc(`projects/${projectId}`).update({ mintCount });
}

export async function updateProject(projectId: string, data: any) {
  await firestore.doc(`projects/${projectId}`).update(data);
}
