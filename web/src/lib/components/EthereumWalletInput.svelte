<script>
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { auth } from '$lib/firebase';
	import { setUserWallet } from '$lib/api';
	import { LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY } from '$lib/localStorage';
	import { connected as wagmiConnected } from 'svelte-wagmi';
	import WalletOptions from './WalletOptions.svelte';

	const dispatch = createEventDispatcher();

	export let hideInfo = false;

	export let autoSubmit = false;

	export let storedWalletAddress = '';

	/**
	 * @type {{ address: string; type: string; } | null}
	 */
	let connectedWallet = null;

	let walletAddress = '';
	let isValid = false;
	let isSubmitting = false;
	let errorMessage = '';
	let successMessage = '';

	/**
	 * @param {string} address
	 */
	function validateEthereumAddress(address) {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	}

	function handleInput() {
		isValid = validateEthereumAddress(walletAddress);
		errorMessage = isValid ? '' : 'Please enter a valid Ethereum wallet address';

		if (storedWalletAddress && walletAddress === storedWalletAddress) {
			isValid = false;
			errorMessage = 'This wallet address is already linked to your account';
		}
	}

	async function submitWalletAddress() {
		if (!isValid) return;

		isSubmitting = true;
		errorMessage = '';
		successMessage = '';

		try {
			const token = await auth.currentUser?.getIdToken();

			if (!token) {
				throw new Error('Failed to get user token');
			}

			const res = await setUserWallet(token, walletAddress);

			if (!res.ok) {
				throw new Error('Failed to submit wallet address');
			}

			successMessage = 'Wallet address submitted successfully!';

			localStorage.setItem(`${LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY}`, walletAddress);

			await new Promise((resolve) => setTimeout(resolve, 1500));

			dispatch('walletAddressSubmitted', walletAddress);
		} catch (error) {
			// @ts-ignore
			errorMessage = 'An error occurred. ' + error.message + ' Please try again. ';
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * @param {{ detail: { address: any; type: any; }; }} event
	 */
	async function handleWalletConnected(event) {
		const { address, type } = event.detail;
		connectedWallet = { address, type };
		console.log(`Wallet connected: ${address} (${type})`);
		walletAddress = address;
		handleInput();
		if (autoSubmit) await submitWalletAddress();
	}

	function handleWalletDisconnected() {
		connectedWallet = null;
		console.log('Wallet disconnected');
	}
</script>

<WalletOptions
	on:walletConnected={handleWalletConnected}
	on:walletDisconnected={handleWalletDisconnected}
/>

{#if !connectedWallet && !$wagmiConnected}
	<div class="divider">
		<span>or</span>
	</div>
{/if}

<div class="wallet-input-container">
	<input
		type="text"
		bind:value={walletAddress}
		on:input={handleInput}
		placeholder="Enter your wallet address"
		class:invalid={!isValid && walletAddress !== ''}
	/>
	<button on:click={submitWalletAddress} disabled={!isValid || isSubmitting} class="submit-button">
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

{#if !hideInfo}
	<div class="wallet-info-container">
		<p>
			Your NFT will be sent to the linked wallet address. You can easily create a new Coinbase
			wallet with passkeys, connect an existing one, or manually enter your address. If you're not
			ready to do this now, don't worry - your claim has been saved and linked to your sign-in
			details, and you can fill this later in your profile.
		</p>
		<p>
			A wallet compatible with the <a
				href="https://www.base.org/"
				target="_blank"
				rel="noopener noreferrer"
				class="wallet-link">Base network</a
			>
			is required. You can read more about
			<a
				href="https://wallet.coinbase.com/"
				target="_blank"
				rel="noopener noreferrer"
				class="wallet-link">Coinbase Wallet here.</a
			>
		</p>
	</div>
{/if}

<style>
	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		margin: 1em 2.5em;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid #ccc;
	}

	.divider span {
		padding: 0 10px;
		color: #888;
		font-size: 0.9em;
	}

	.wallet-input-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 1em 0;
		padding: 1em 2em;
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
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 25px;
		font-weight: bold;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		font-size: 1rem;
	}

	.submit-button {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.wallet-info-container {
		padding: 1em;
		margin: 0em auto;
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

		.wallet-input-container input {
			border-radius: 25px 0 0 25px;
			border-right: none;
		}

		.wallet-input-container button {
			border-radius: 0 25px 25px 0;
			width: auto;
		}
	}
</style>
