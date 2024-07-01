# NFT Airdrop Contract

## Development

Compile
```shell
npx hardhat compile
```

Shell 1:
```shell
npx hardhat node
```

Shell 2:
```shell
npx hardhat run scripts/deploy.ts --network localhost
```


## Base Testnet Deployment

```shell
npx hardhat run scripts/deploy.ts --network base_sepolia
``` 

## Base Mainnet Deployment

```shell
npx hardhat run scripts/deploy.ts --network base_mainnet
```

## Zora Testnet Deployment

```shell
npx hardhat run scripts/deploy.ts --network zora_sepolia
```

## Zora Mainnet Deployment

```shell
npx hardhat run scripts/deploy.ts --network zora_mainnet
```

## Hardhat

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
