<script>
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { auth } from '$lib/firebase';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';

	const dispatch = createEventDispatcher();

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

			const res = await fetch(`${PUBLIC_API_BASE_URL}/user/addWalletAddress`, {
				method: 'POST',
				headers: {
					Authorization: `${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ primaryEthereumWallet: walletAddress })
			});

			if (!res.ok) {
				errorMessage = 'Failed to submit wallet address';
				throw new Error('Failed to submit wallet address');
			}

			successMessage = 'Wallet address submitted successfully!';

			await new Promise((resolve) => setTimeout(resolve, 1500));

			dispatch('walletAddressSubmitted', walletAddress);
		} catch (error) {
			errorMessage = 'An error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<p>
	Your NFT is still in our custody. Please add your wallet address here, so we know where to airdrop
	the NFT. Don't worry if you can't do this right away, we will try our best to keep it safe for
	you.
</p>
<p>
	A wallet compatible with the Zora and Base networks is required. If you don't have one, we suggest
	using <a
		href="https://metamask.io/"
		target="_blank"
		rel="noopener noreferrer"
		class="wallet-link metamask">Metamask</a
	>
	or
	<a
		href="https://brave.com/wallet/"
		target="_blank"
		rel="noopener noreferrer"
		class="wallet-link brave">Brave Wallet</a
	>.
</p>
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
		margin-top: 1em;
	}

	input {
		flex-grow: 1;
		padding: 0.8em 1em;
		border: 2px solid var(--accent-color);
		border-radius: 25px 0 0 25px;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.3s ease;
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
		border-radius: 0 25px 25px 0;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: opacity 0.3s ease;
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
</style>
