<script>
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { auth } from '$lib/firebase';
	import { setUserWallet } from '$lib/api';

	const dispatch = createEventDispatcher();

	export let hideInfo = false;

	let walletAddress = '';
	let isValid = false;
	let isSubmitting = false;
	let errorMessage = '';
	let successMessage = '';

	/**
	 * @param {string} address
	 */
	function validateEthereumAddress(address) {
		// Basic Ethereum address validation
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	}

	function handleInput() {
		isValid = validateEthereumAddress(walletAddress);
		errorMessage = isValid ? '' : 'Please enter a valid Ethereum wallet address';
	}

	async function submitWalletAddress() {
		if (!isValid) return;

		isSubmitting = true;
		errorMessage = '';
		successMessage = '';

		try {
			const token = await auth.currentUser?.getIdToken(true);

			if (!token) {
				throw new Error('Failed to get user token');
			}

			const res = await setUserWallet(token, walletAddress);

			if (!res.ok) {
				throw new Error('Failed to submit wallet address');
			}

			successMessage = 'Wallet address submitted successfully!';

			await new Promise((resolve) => setTimeout(resolve, 1500));

			dispatch('walletAddressSubmitted', walletAddress);
		} catch (error) {
			// @ts-ignore
			errorMessage = 'An error occurred. ' + error.message + ' Please try again. ';
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if !hideInfo}
	<p>
		Your NFT is still in our custody. Please add your wallet address here, so we know where to
		airdrop the NFT. Don't worry if you can't do this right away, we will try our best to keep it
		safe for you.
	</p>
	<p>
		A wallet compatible with the Zora and Base networks is required. If you don't have one, we
		suggest using <a
			href="https://metamask.io/"
			target="_blank"
			rel="noopener noreferrer"
			class="wallet-link">Metamask</a
		>
		or
		<a
			href="https://brave.com/wallet/"
			target="_blank"
			rel="noopener noreferrer"
			class="wallet-link">Brave Wallet</a
		>.
	</p>
{/if}

<div class="wallet-input-container">
	<input
		type="text"
		bind:value={walletAddress}
		on:input={handleInput}
		placeholder="Enter your Ethereum wallet address"
		class:invalid={!isValid && walletAddress !== ''}
	/>
	<button on:click={submitWalletAddress} disabled={!isValid || isSubmitting}>
		{#if isSubmitting}
			Submitting...
		{:else}
			Submit
		{/if}
	</button>
</div>

{#if errorMessage}
	<p class="error-message" transition:fade>
		{errorMessage}
	</p>
{/if}

{#if successMessage}
	<p class="success-message" transition:fade>
		{successMessage}
	</p>
{/if}

<style>
	.wallet-input-container {
		display: flex;
		flex-direction: column;
		margin-top: 1em;
		max-width: 100%;
	}

	input {
		width: 100%;
		padding: 0.8em 1em;
		border: 2px solid var(--accent-color);
		border-radius: 25px;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.3s ease;
		box-sizing: border-box;
	}

	input.invalid {
		border-color: #ff6b6b;
	}

	input:focus {
		border-color: var(--gradient-end);
	}

	button {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 25px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: opacity 0.3s ease;
		margin-top: 1em;
		width: 100%;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	button:hover:not(:disabled) {
		opacity: 0.9;
	}

	.error-message {
		color: #ff6b6b;
		margin-top: 0.5em;
	}

	.success-message {
		color: #28a745;
		margin-top: 0.5em;
	}
	.wallet-link {
		font-weight: 600;
		color: var(--accent-color);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.wallet-link:hover {
		color: var(--gradient-end);
		text-decoration: underline;
	}

	@media (min-width: 768px) {
		.wallet-input-container {
			flex-direction: row;
		}

		input {
			border-radius: 25px 0 0 25px;
			border-right: none;
		}

		button {
			border-radius: 0 25px 25px 0;
			margin-top: 0;
			width: auto;
		}
	}
</style>
