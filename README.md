# onchainsummer-nft-surprise

My submission for the Onchain Summer Buildathon https://www.base.org/onchainsummer

This project is a part of the CREATOR with Zora -track.

## Mint Wave - NFT Surprise

The project and introduction is available at https://nft-surprise.web.app/

TL;DR: This is app gives the ability to easily create a NFT airdrop that everyone with a smartphone can sign up for. No need for a wallet or any prior knowledge about blockchain and NFTs. The project is built on Base and relies on the NFT minting capabilities of Zora.

### Demo

![QR Code](./README-QR.svg)

Sign up for a NFT by scanning the above QR or just click this link: https://nft-surprise.web.app/claim/?id=2g9qj6qG6eAa9CXlKk5K

QR code generated here: https://nft-surprise.web.app/qr/?id=2g9qj6qG6eAa9CXlKk5K

## Technology

Frontend:
- SvelteKit
- Firebase Auth
- Hosted on Firebase

Backend:
- Node.js 20
- Firestore DB
- ethers.js
- Hosted on GCP App Engine

## Next Steps

- Also store the people signing up for the Airdrops on Base (keep Firebase as a backup)
- Project creation & management
  - Toggle project public visibility on/off
  - Export addresses for easy airdrop on zora.co
  - Track the wallets to check if they received their airdrop
  - Create NFTs on Zora for people who don't have a wallet yet
  - Store and manage NFTs with a developer wallet to allow automated and scheduled airdrops
