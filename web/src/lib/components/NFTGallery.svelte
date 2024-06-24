<script>
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { onMount } from 'svelte';

	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;

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
		const token = await currentUser.getIdToken(true);
		if (!token) {
			console.error('No token found for user', currentUser);
			return;
		}

		isLoading = true;
		const res = await fetch(`${PUBLIC_API_BASE_URL}/mints`, {
			method: 'GET',
			headers: {
				Authorization: `${token}`
			}
		});
		if (res.status === 200) {
			nfts = await res.json();
		}
		isLoading = false;
	}

	/**
	 * @param {{ walletAddress: any; airdropDateTime: string | number | Date; }} nft
	 */
	function getMintStatus(nft) {
		if (!nft.walletAddress) {
			return {
				status: 'Waiting for you to add your wallet address on your Profile',
				class: 'status-unknown'
			};
		} else if (!nft.airdropDateTime) {
			return { status: `Waiting for airdrop to ${nft.walletAddress}`, class: 'status-waiting' };
		} else {
			return {
				status: `Airdropped to ${nft.walletAddress} on ${new Date(nft.airdropDateTime).toLocaleString()}`,
				class: 'status-airdropped'
			};
		}
	}
</script>

<div class="nft-gallery">
	<h2>{currentUser.displayName && currentUser.displayName + "'s "}NFT Collection</h2>

	{#if isLoading}
		<p>Loading your NFTs...</p>
	{:else if nfts.length > 0}
		<div class="nft-grid">
			{#each nfts as nft (nft.id)}
				{@const status = getMintStatus(nft)}
				<div class="nft-card">
					<img src={nft.image} alt={nft.title} class="nft-image" />
					<div class="nft-info">
						<h3>{nft.title}</h3>
						<p>{nft.description}</p>
						{#if nft.nftLink}
							<a href={nft.nftLink} target="_blank" rel="noopener noreferrer" class="view-on-zora">
								View on Zora
							</a>
						{/if}
						<p class={`mint-status ${status.class}`}>{status.status}</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p>You haven't minted any NFTs yet.</p>
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
