# onchainsummer-nft-surprise

## Mint Wave: NFT Airdrop Tracker

An easy-to-use NFT airdrop tracker and signup system built on Base.

This project is my submission for the [Onchain Summer Buildathon](https://www.base.org/onchainsummer), participating in the CREATOR track with Zora.

Project URL: [https://nft-surprise.web.app](https://nft-surprise.web.app)

## About Mint Wave

Mint Wave is a NFT Airdrop Tracker that simplifies the process of creating and distributing NFT airdrops.

**Key Features:**
- Easy creation of NFT airdrops
- Accessible to anyone with a smartphone
- No wallet or blockchain knowledge required
- Built on Base blockchain
- Utilizes Zora's NFT minting capabilities

Mint Wave bridges the gap between NFT creators and potential recipients, making the world of blockchain-based digital assets more accessible to everyone.

### Demo

Experience Mint Wave in action with this two-part demo:

#### 1. Airdrop Creator

Scenario: You've created an ERC-1155 NFT on Zora.co (recorded on the Base blockchain) and want to airdrop it to your community.

Steps:
1. Use Mint Wave to generate a unique QR code for your airdrop.
2. Share this QR code with your community.

[View a demo QR code created by me](https://nft-surprise.web.app/qr/?id=2g9qj6qG6eAa9CXlKk5K)

Note: Each QR code is tied to a unique ID in our Google Firestore database. Guessing it is not possible, but it's designed to be shared publicly. When scanned, it directs users to your custom airdrop page.

#### 2. Airdrop Sign-up

Community members can easily sign up for your free NFT airdrop by:
- Scanning the QR code, or
- Clicking a direct link

[Try the demo airdrop sign-up](https://nft-surprise.web.app/claim/?id=2g9qj6qG6eAa9CXlKk5K)

This demo showcases how Mint Wave simplifies both the creation and distribution of NFT airdrops, making the process accessible to creators and recipients alike.


## Technology Stack

Mint Wave leverages a diverse set of modern technologies to create a seamless NFT airdrop experience:

### Frontend
- **SvelteKit**: Fast and efficient framework for building user interfaces
- **Firebase Auth**: Secure user authentication system with multiple login options and 3rd party providers
- **wagmi**: SvelteKit plugin for easy wallet integration
- **Firebase Hosting**: Reliable and scalable web hosting

### Backend
- **Node.js 20**: Latest stable version of the JavaScript runtime
- **Google Cloud Platform (GCP) App Engine**: Fully managed serverless application platform
- **Firestore DB**: Flexible, scalable NoSQL cloud database

### Blockchain Integration
- **ethers.js**: Complete Ethereum library and wallet implementation
- **Solidity**: Smart contract programming language for Ethereum-based blockchains
- **NFTAirdropTracker Contract**: Custom smart contract for managing NFT airdrops on Base or Zora networks
- **Hardhat**: Development environment for compiling, deploying, testing, and debugging Ethereum software

### Deployment
- **Base & Zora Networks**: Supported blockchains for contract deployment
  - Mainnets: For production-ready airdrops
  - Sepolia Testnets: For testing and development

This stack enables Mint Wave to provide a robust, scalable, and user-friendly platform for creating and managing NFT airdrops across multiple blockchain networks.

## Next Steps

To further develop and deploy Mint Wave, I plan to:

1. **Enhance Airdrop Creation and Collecting**
   - Board collectors instantly on-chain with Coinbase Smart Wallets if they don't have a wallet
   - Add wallet integration with wagmi
   - Allow to mint NFTs straight to the collector's wallet so that copy-pasting to zora.co airdrop feature is not needed
   - Develop a user-friendly interface for NFT creation and customization

2. **Security Audit**
   - Conduct a thorough security audit of smart contract and application code
   - Implement any necessary security enhancements

3. **Real-World Testing and Mainnet deployment**
   - Conduct a pilot airdrop on the Base mainnet with a small community
   - Add support for Zora mainnet and deploying the contract on Zora network
   - Gather feedback and iterate on the user experience

4. **Documentation and Community Building**
   - Create comprehensive user and developer documentation
   - Establish community channels for support and feedback

5. **Finalize Project Branding**
   - Decide on the official project name
   - Select and acquire a domain name

6. **Launch and Promote**
    - Launch the platform for public use
    - Promote the platform to potential NFT creators and communities


All contributions and feedback from the community are greatly appreciated as we work towards these goals!

