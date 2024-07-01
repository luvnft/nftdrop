import { ethers } from "hardhat";
import { parseEther, formatEther } from "ethers";

async function getGasPrice() {
  // Try different methods to get the gas price
  try {
    // Method for newer versions of ethers
    const feeData = await ethers.provider.getFeeData();
    return feeData.gasPrice ?? ethers.parseUnits("20", "gwei");
  } catch (error) {
    console.error("Error getting gas price using getFeeData:", error);
    throw error;
  }
}

async function main() {
  const NFTAirdropTracker = await ethers.getContractFactory(
    "NFTAirdropTracker"
  );

  // Estimate the gas cost for deployment
  const deploymentGasEstimate = await ethers.provider.estimateGas(
    await NFTAirdropTracker.getDeployTransaction()
  );

  console.log(`Estimated gas for deployment: ${deploymentGasEstimate}`);

  // Get the current gas price
  const gasPrice = await getGasPrice();

  // Calculate the estimated deployment cost in wei
  const estimatedCost = deploymentGasEstimate * gasPrice;

  console.log(`Estimated deployment cost: ${formatEther(estimatedCost)} ETH`);

  // Set a maximum fee you're willing to pay (in ETH)
  const maxFeeETH = "0.0001"; // Adjust this value as needed
  const maxFeeWei = parseEther(maxFeeETH);

  if (estimatedCost > maxFeeWei) {
    console.error(
      `Estimated cost (${formatEther(
        estimatedCost
      )} ETH) exceeds maximum allowed fee (${maxFeeETH} ETH). Aborting deployment.`
    );
    process.exit(1);
  }

  console.log(`Proceeding with deployment (estimated cost is within limit)...`);

  // Deploy the contract with a gas limit
  const nftAirdropTracker = await NFTAirdropTracker.deploy({
    gasLimit: (deploymentGasEstimate * BigInt(120)) / BigInt(100), // Add 20% buffer to the estimate
    maxFeePerGas: gasPrice * BigInt(2), // Set a maximum fee per gas (2x current price in this example)
  });

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
