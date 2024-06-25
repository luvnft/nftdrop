import * as dotenv from "dotenv";
dotenv.config();
import { ethers, JsonRpcProvider } from "ethers";
import NFTAirdropTracker from "../../../eth/artifacts/contracts/NFTAirdropTracker.sol/NFTAirdropTracker.json";

const { BASE_RPC_URL, WALLET_PRIVATE_KEY, DEPLOYED_CONTRACT_ADDRESS } =
  process.env;

if (!BASE_RPC_URL) {
  throw new Error("BASE_RPC_URL is required");
}

if (!WALLET_PRIVATE_KEY) {
  throw new Error("WALLET_PRIVATE_KEY is required");
}

if (!DEPLOYED_CONTRACT_ADDRESS) {
  throw new Error("DEPLOYED_CONTRACT_ADDRESS is required");
}

const provider = new JsonRpcProvider(BASE_RPC_URL);
const signer = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  DEPLOYED_CONTRACT_ADDRESS,
  NFTAirdropTracker.abi,
  signer
);

export async function createProject(projectId: string) {
  const tx = await contract.createProject(projectId);
  await tx.wait();
  console.log(`Project ${projectId} created`);
}

export async function recordClaim(projectId: string, userId: string) {
  const tx = await contract.recordClaim(projectId, userId);
  await tx.wait();
  console.log(`Claim recorded for user ${userId} in project ${projectId}`);
}

export function getWallet() {
  return signer;
}
