<script>
	import { onMount } from 'svelte';
	import Loader from './Loader.svelte';
	import { fetchMints } from '$lib/api';
	import { PUBLIC_BASE_BLOCKSCOUT_URL } from '$env/static/public';
	import { getZoraCollectUrl } from '$lib';

	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;
	/**
	 * @type {string | null}
	 */
	export let airdropWalletAddress;

	/**
	 * @type {string | any[]}
	 */
	let nfts = [];
	let isLoading = true;

	onMount(async () => {
		if (currentUser) {
			await fetchNFTs();
		}
	});

	async function fetchNFTs() {
		if (!currentUser) {
			console.error('No user found');
			return;
		}
		const token = await currentUser.getIdToken();
		if (!token) {
			console.error('No token found for user', currentUser);
			return;
		}

		isLoading = true;
		const res = await fetchMints(token);
		if (res.status === 200) {
			nfts = await res.json();
		}
		isLoading = false;
	}

	/**
	 * @param {number} baseClaimState
	 * @param {string | null} airdropWalletAddress
	 */
	function getMintStatus(baseClaimState, airdropWalletAddress) {
		switch (baseClaimState) {
			case 0:
				return {
					status: `Not claimed`,
					class: 'status-unknown'
				};
			case 1:
				if (!airdropWalletAddress) {
					return {
						status: 'Waiting for you to add your wallet address on your Profile',
						class: 'status-unknown'
					};
				}
				return {
					status: `Waiting for project owner to airdrop to your wallet`,
					class: 'status-waiting'
				};
			case 2:
				return {
					status: `NFT has been airdropped to your wallet`,
					class: 'status-airdropped'
				};
			default:
				return {
					status: 'Unknown mint status',
					class: 'status-unknown'
				};
		}
	}
</script>

<div class="nft-gallery">
	<h2>{currentUser.displayName && currentUser.displayName + "'s "}NFT Collection</h2>

	{#if isLoading}
		<Loader />
	{:else if nfts.length > 0}
		<div class="nft-grid">
			{#each nfts as nft (nft.id)}
				{@const status = getMintStatus(nft.baseClaimState, airdropWalletAddress)}
				<div class="nft-card">
					<img src={nft.image} alt={nft.title} class="nft-image" />
					<div class="nft-info">
						<h3>{nft.title}</h3>
						<p>{nft.description}</p>
						{#if nft.nftContractAddress && nft.tokenId}
							<a
								href={getZoraCollectUrl(nft.nftContractAddress, nft.tokenId)}
								target="_blank"
								rel="noopener noreferrer"
								class="view-on-zora"
							>
								View on Zora
							</a>
						{/if}
						<p class={`mint-status ${status.class}`}>{status.status}</p>
						{#if nft.recordClaimTxHash}
							<p>
								<a
									class="text-link"
									href={`${PUBLIC_BASE_BLOCKSCOUT_URL}/tx/${nft.recordClaimTxHash}`}
									target="_blank"
									rel="noopener noreferrer"><i>View claim on Blockscout</i></a
								>
							</p>
						{/if}
						{#if nft.nftAirdroppedTxHash}
							<p>
								<a
									class="text-link"
									href={`${PUBLIC_BASE_BLOCKSCOUT_URL}/tx/${nft.nftAirdroppedTxHash}`}
									target="_blank"
									rel="noopener noreferrer"><i>View airdrop on Blockscout</i></a
								>
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p>You haven't claimed any NFTs yet.</p>
	{/if}
</div>

<style>
	.nft-gallery {
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		color: var(--accent-color);
		text-align: center;
		margin-bottom: 2rem;
	}

	.nft-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 2rem;
	}

	.nft-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(6px);
		border-radius: 15px;
		overflow: hidden;
		transition: transform 0.3s ease;
	}

	.nft-card:hover {
		transform: translateY(-5px);
	}

	.nft-image {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	.nft-info {
		padding: 1rem;
	}

	.nft-info h3 {
		margin-top: 0;
		color: var(--accent-color);
	}

	.view-on-zora {
		display: inline-block;
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 25px;
		margin-top: 1rem;
		transition: opacity 0.3s ease;
	}

	.view-on-zora:hover {
		opacity: 0.9;
	}

	.mint-status {
		margin-top: 1rem;
		padding: 0.5rem;
		border-radius: 5px;
		font-size: 0.9em;
	}

	.status-unknown {
		background-color: rgba(255, 255, 0, 0.2);
		color: #b3a600;
	}

	.status-waiting {
		background-color: rgba(0, 0, 255, 0.2);
		color: #0000b3;
	}

	@media (prefers-color-scheme: dark) {
		.status-waiting {
			color: #4c4ce0;
		}
	}

	.status-airdropped {
		background-color: rgba(0, 255, 0, 0.2);
		color: #00b300;
	}

	@media (max-width: 600px) {
		.nft-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
