import { getUserData, setUserWallet, UserData } from "../models/user";
import { firestore } from "../config/firebase";
import logger from "../utils/logger";

export async function getUserInfo(uid: string): Promise<UserData> {
  return await getUserData(uid);
}

export async function updateUserWallet(
  uid: string,
  primaryEthereumWallet: string
): Promise<void> {
  await setUserWallet(uid, primaryEthereumWallet);

  const mintsWithWrongWalletAddress = await firestore
    .collection("mints")
    .where("uid", "==", uid)
    .where("aidroppedOn", "==", null)
    .where("walletAddress", "!=", primaryEthereumWallet)
    .get();

  if (mintsWithWrongWalletAddress.size > 0) {
    const mintIds = mintsWithWrongWalletAddress.docs.map((doc) => doc.id);
    logger.info(
      "setting walletAddress for mints to",
      primaryEthereumWallet,
      mintIds
    );
    await Promise.all(
      mintIds.map((id) =>
        firestore.doc(`mints/${id}`).update({
          walletAddress: primaryEthereumWallet,
        })
      )
    );
  }
}
