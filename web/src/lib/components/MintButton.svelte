<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import EthereumWalletInput from './EthereumWalletInput.svelte';
	import { formatTimestamp } from '$lib';
	import { PUBLIC_BASE_BLOCKSCOUT_URL } from '$env/static/public';

	export let mint;
	export let isMinting;
	export let mintingComplete;
	export let claimedAt;
	export let userAlreadyMinted;
	export let project;
	export let airdropWalletAddress;
	export let walletAddressSubmitted;
	/**
	 * @type {import("@firebase/auth").User | null}
	 */
	export let currentUser;

	let claimLimitReached = false;

	$: if (project.claimLimit !== undefined) {
		claimLimitReached = project.mintCount >= project.claimLimit;
	}

	const progress = tweened(0, {
		duration: 10000,
		easing: cubicOut
	});

	$: if (isMinting) {
		progress.set(1);
	} else {
		progress.set(0);
	}
</script>

{#if !userAlreadyMinted && !mintingComplete}
	<button
		on:click={mint}
		class="primary-button"
		disabled={isMinting || !project.claimOpen || claimLimitReached}
	>
		{#if isMinting}
			<div class="minting-progress">
				<div class="progress-bar" style="width: {$progress * 100}%"></div>
			</div>
			Minting...
		{:else if claimLimitReached}
			Claim limit has been reached
		{:else if project.claimOpen}
			Claim the free NFT
		{:else}
			Claiming is closed
		{/if}
	</button>
{:else if userAlreadyMinted}
	<div class="minting-complete">
		<h3>Hello again {currentUser?.displayName ?? ''}!</h3>
		<p>
			Only 1 NFT per user can be claimed and you've already claimed your NFT on {formatTimestamp(
				claimedAt
			)}.
			{#if project.recordClaimTxHash}
				<a
					class="text-link"
					href={`${PUBLIC_BASE_BLOCKSCOUT_URL}/tx/${project.recordClaimTxHash}`}
					target="_blank"
					rel="noopener noreferrer"><i>View on Blockscout</i></a
				>
			{/if}
		</p>
		{#if !airdropWalletAddress}
			<p>No wallet linked for airdrop</p>
			<EthereumWalletInput on:walletAddressSubmitted={walletAddressSubmitted} autoSubmit={true} />
		{:else if mint.baseClaimState === 2}
			<p>We have already airdropped the NFT to your wallet</p>
		{:else}
			<p>We will airdrop the NFT to your wallet <code>{airdropWalletAddress}</code></p>
		{/if}
	</div>
{:else}
	<div class="minting-complete">
		<h3>🎉 Congratulations!</h3>
		<p>
			You've successfully claimed the NFT #{project.mintCount}.
			{#if project.recordClaimTxHash}
				<br />
				<a
					class="text-link"
					href={`${PUBLIC_BASE_BLOCKSCOUT_URL}/tx/${project.recordClaimTxHash}`}
					target="_blank"
					rel="noopener noreferrer"><i>View on Blockscout</i></a
				>
			{/if}
		</p>

		{#if !airdropWalletAddress}
			<EthereumWalletInput on:walletAddressSubmitted={walletAddressSubmitted} />
		{:else}
			<p>We will soon airdrop the NFT to your wallet <code>{airdropWalletAddress}</code></p>
		{/if}
	</div>
{/if}

<style>
	.primary-button {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		padding: 1em 2em;
		font-size: 1.2rem;
		margin-top: 2em;
		margin-bottom: 2em;
		position: relative;
		overflow: hidden;
		border: none;
		border-radius: 25px;
		font-weight: bold;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.primary-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.primary-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.minting-progress {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 4px;
		width: 100%;
		background-color: rgba(255, 255, 255, 0.3);
	}

	.progress-bar {
		height: 100%;
		background-color: white;
		transition: width 0.3s ease;
	}

	.minting-complete {
		background: var(--card-background);
		backdrop-filter: blur(10px);
		border-radius: 15px;
		margin: 2em 0;
		padding: 1em 0;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		text-align: center;
		width: 100%;
		max-width: 500px;
		overflow-wrap: break-word;
		overflow: hidden;
	}

	.minting-complete h3 {
		margin: 1em 0;
		padding: 1em;
	}

	.minting-complete p {
		padding: 1em;
	}
</style>
