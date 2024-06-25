import { firestore } from "../config/firebase";

export interface Project {
  title: string;
  from: string;
  description: string;
  image: string;
  nftLink: string;
  mintCount?: number;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const project = await firestore.doc(`projects/${projectId}`).get();
  return project.exists ? (project.data() as Project) : null;
}

export async function updateProjectMintCount(
  projectId: string,
  mintCount: number
) {
  await firestore.doc(`projects/${projectId}`).update({ mintCount });
}
