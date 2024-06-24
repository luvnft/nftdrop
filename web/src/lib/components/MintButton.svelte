<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let mint;
	export let isMinting;
	export let mintingComplete;
	export let mintingInfo;

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

{#if !mintingComplete}
	<button on:click={mint} class="primary-button" disabled={isMinting}>
		{#if isMinting}
			<div class="minting-progress">
				<div class="progress-bar" style="width: {$progress * 100}%"></div>
			</div>
			Minting...
		{:else}
			Mint NFT
		{/if}
	</button>
{:else}
	<div class="minting-complete">
		<h3>🎉 Congratulations!</h3>
		<p>You've successfully minted your NFT.</p>
		<p>Total NFTs minted in this project: {mintingInfo.totalMinted}</p>
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
	}

	.minting-complete h3 {
		margin-top: 0;
	}
</style>
