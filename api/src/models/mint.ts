import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";
import { ClaimState, getClaimState } from "../blockchain/base";

export interface Mint {
  projectId: string;
  uid: string;
  from: string;
  title: string;
  description: string;
  image: string;
  nftContractAddress: string;
  tokenId: string;
  timestamp: Timestamp;
  baseClaimState: ClaimState;
  recordClaimTxHash: string;
}

export async function getUserMint(
  projectId: string,
  uid: string
): Promise<Mint | undefined> {
  const mint = await firestore
    .collection("mints")
    .where("projectId", "==", projectId)
    .where("uid", "==", uid)
    .limit(1)
    .get();

  if (mint.empty) {
    return undefined;
  }

  return mint.docs[0].data() as Mint;
}

export async function getProjectMintCount(projectId: string): Promise<number> {
  const result = await firestore
    .collection("mints")
    .where("projectId", "==", projectId)
    .count()
    .get();

  return result.data().count;
}

export async function createMint(mintData: Mint): Promise<string> {
  const result = await firestore.collection("mints").add(mintData);
  return result.id;
}

export async function getUserMints(uid: string): Promise<Mint[]> {
  const userMints = await firestore
    .collection("mints")
    .where("uid", "==", uid)
    .get();

  const mints = userMints.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      } as unknown as Mint)
  );

  const mintsWithStatus = await Promise.all(
    mints.map(async (mint) => {
      mint.baseClaimState = await getClaimState(mint.projectId, uid);
      return mint;
    })
  );

  return mintsWithStatus;
}
