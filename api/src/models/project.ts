import { firestore } from "../config/firebase";

export interface Project {
  id?: string;
  title: string;
  from: string;
  description: string;
  image: string;
  nftLink: string;
  uid: string;
  claimOpen: boolean;
  mintCount?: number;
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

export async function updateProjectClaimOpen(
  projectId: string,
  claimOpen: boolean
) {
  await firestore.doc(`projects/${projectId}`).update({ claimOpen });
}

export async function updateProjectMintCount(
  projectId: string,
  mintCount: number
) {
  await firestore.doc(`projects/${projectId}`).update({ mintCount });
}