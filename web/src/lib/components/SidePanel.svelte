<script>
	import { auth } from '$lib/firebase';
	export let viewNfts;
	export let hasNfts;
</script>

<div class="side-panel">
	{#if hasNfts}
		<button on:click={viewNfts} class="secondary-button">View your NFTs</button>
	{/if}
	<button on:click={() => auth.signOut()} class="signout-button">Sign out</button>
</div>

<style>
	.side-panel {
		margin-top: 2rem;
		gap: 1rem;
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.secondary-button,
	.signout-button {
		background: var(--gradient-start);
		color: white;
		padding: 0.6em 1em;
		font-size: 0.9rem;
		opacity: 0.8;
		transition: opacity 0.2s;
		border: none;
		border-radius: 25px;
		font-weight: bold;
		cursor: pointer;
	}

	.secondary-button:hover,
	.signout-button:hover {
		opacity: 1;
	}

	.signout-button {
		background: var(--gradient-end);
	}
</style>
