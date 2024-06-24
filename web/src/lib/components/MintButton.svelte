<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import EthereumWalletInput from './EthereumWalletInput.svelte';
	import { formatTimestamp } from '$lib';

	export let mint;
	export let isMinting;
	export let mintingComplete;
	export let mintedOn;
	export let userAlreadyMinted;
	export let project;
	export let primaryEthereumWallet;
	export let walletAddressSubmitted;
	/**
	 * @type {import("@firebase/auth").User | null}
	 */
	export let currentUser;

	const progress = tweened(0, {
		duration: 1000,
		easing: cubicOut
	});

	$: if (isMinting) {
		progress.set(1);
	} else {
		progress.set(0);
	}
</script>

{#if !userAlreadyMinted && !mintingComplete}
	<button on:click={mint} class="primary-button" disabled={isMinting}>
		{#if isMinting}
			<div class="minting-progress">
				<div class="progress-bar" style="width: {$progress * 100}%"></div>
			</div>
			Minting...
		{:else}
			Claim the free NFT
		{/if}
	</button>
{:else if userAlreadyMinted}
	<div class="minting-complete">
		<h3>✨ Hello again {currentUser?.displayName ?? ''}!</h3>
		<p>
			Only 1 NFT per user can be collected and you've already collected your NFT on {formatTimestamp(
				mintedOn
			)}.
		</p>
		{#if !primaryEthereumWallet}
			<EthereumWalletInput on:walletAddressSubmitted={walletAddressSubmitted} />
			<!-- {:else if alreadyAirdropped}
			<p>We have already airdropped the NFT to your wallet {primaryEthereumWallet}</p> -->
		{:else}
			<p>We will soon airdrop the NFT to your wallet <code>{primaryEthereumWallet}</code></p>
		{/if}
	</div>
{:else}
	<div class="minting-complete">
		<h3>🎉 Congratulations!</h3>
		<p>You've successfully collected the NFT #{project.mintCount}.</p>
		{#if !primaryEthereumWallet}
			<EthereumWalletInput on:walletAddressSubmitted={walletAddressSubmitted} />
		{:else}
			<p>We will soon airdrop the NFT to your wallet <code>{primaryEthereumWallet}</code></p>
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
		padding: 2em;
		margin: 2em 0;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		text-align: center;
		max-width: 500px;
	}

	.minting-complete h3 {
		margin-top: 0;
	}
</style>
