import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    hardhat: {},
    base_sepolia: {
      url: "https://api.developer.coinbase.com/rpc/v1/base-sepolia/hvla5h8gm-vJOii6BHRjyyYljKQ7se58", //"https://sepolia.base.org",
      accounts: process.env.WALLET_PRIVATE_KEY
        ? [process.env.WALLET_PRIVATE_KEY]
        : [],
      chainId: 84532,
    },
    zora_sepolia: {
      url: "https://sepolia.rpc.zora.energy",
      accounts: process.env.WALLET_PRIVATE_KEY
        ? [process.env.WALLET_PRIVATE_KEY]
        : [],
      chainId: 999999999,
    },
  },
};

export default config;
