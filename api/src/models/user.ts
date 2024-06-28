import { firestore } from "../config/firebase";

export interface UserData {
  airdropWalletAddress?: string;
}

export async function getUserData(uid: string): Promise<UserData> {
  const res = await firestore.doc(`users/${uid}`).get();
  if (!res.exists) {
    return {};
  }
  return res.data() as UserData;
}

export async function setUserWallet(uid: string, airdropWalletAddress: string) {
  await firestore
    .doc(`users/${uid}`)
    .set({ airdropWalletAddress }, { merge: true });
}
