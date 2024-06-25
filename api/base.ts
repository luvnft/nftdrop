import * as dotenv from "dotenv";
dotenv.config();
import { ethers, JsonRpcProvider } from "ethers";

const { BASE_RPC_URL, WALLET_PRIVATE_KEY } = process.env;

if (!BASE_RPC_URL) {
  throw new Error("BASE_RPC_URL is required");
}

if (!WALLET_PRIVATE_KEY) {
  throw new Error("WALLET_PRIVATE_KEY is required");
}

// Initialize provider
const provider = new JsonRpcProvider(BASE_RPC_URL);

// Create a wallet instance
const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

export function getWallet() {
  return wallet;
}
