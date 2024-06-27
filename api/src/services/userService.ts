import { getUserData, setUserWallet, UserData } from "../models/user";
import { firestore } from "../config/firebase";
import logger from "../utils/logger";
import { recordWalletAddressOnChain } from "../blockchain/base";

export async function getUserInfo(uid: string): Promise<UserData> {
  return await getUserData(uid);
}

export async function updateUserWallet(
  uid: string,
  primaryEthereumWallet: string
): Promise<void> {
  const txResult = await recordWalletAddressOnChain(uid, primaryEthereumWallet);

  if (!txResult.success) {
    logger.error("Failed to record wallet address on blockchain", txResult);
    throw new Error("Failed to record wallet address on blockchain");
  }

  await setUserWallet(uid, primaryEthereumWallet);
}
