import { ethers } from "hardhat";

async function main() {
  const NFTAirdropTracker = await ethers.getContractFactory(
    "NFTAirdropTracker"
  );
  const nftAirdropTracker = await NFTAirdropTracker.deploy();

  await nftAirdropTracker.waitForDeployment();

  console.log(
    "NFTAirdropTracker deployed to:",
    await nftAirdropTracker.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
