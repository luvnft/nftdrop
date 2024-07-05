<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
	import {
		signerAddress as wagmiSignerAddress,
		connected as wagmiConnected,
		disconnectWagmi,
		WC
	} from 'svelte-wagmi';
	import CoinbaseWalletLogo from './CoinbaseWalletLogo.svelte';

	export let disabled = false;

	let sdk;
	/** @type {import("@coinbase/wallet-sdk").ProviderInterface} */
	let provider;

	let isConnecting = false;

	const dispatch = createEventDispatcher();

	onMount(() => {
		sdk = new CoinbaseWalletSDK({
			appName: 'Mint Wave',
			appChainIds: [8453]
		});
		provider = sdk.makeWeb3Provider();
	});

	async function connectCoinbaseWallet() {
		isConnecting = true;
		try {
			const [address] = await provider.request({
				method: 'eth_requestAccounts'
			});
			console.log('Connected Coinbase Wallet:', address);

			wagmiSignerAddress.set(address);
			wagmiConnected.set(true);
			dispatch('walletConnected', { address: address, type: 'coinbase' });
		} catch (error) {
			console.error('Failed to connect Coinbase Wallet:', error);
		} finally {
			isConnecting = false;
		}
	}

	async function connectExistingWallet() {
		isConnecting = true;
		const appHeader = document.getElementById('mintwave-header');
		if (appHeader) appHeader.style.display = 'none';
		try {
			await WC();
			dispatch('walletConnected', { address: $wagmiSignerAddress, type: 'other' });
		} catch (error) {
			console.error('Failed to connect wallet via wagmi:', error);
		} finally {
			isConnecting = false;
			if (appHeader) appHeader.style.display = '';
		}
	}

	async function disconnectWallet() {
		await disconnectWagmi();
		dispatch('walletDisconnected');
	}

	$: walletAddress = $wagmiSignerAddress || '';
	$: isConnected = $wagmiConnected;
</script>

{#if walletAddress}
	<p class="connected-wallet">Connected wallet address: {walletAddress}</p>
{/if}

<div class="wallet-options-container">
	{#if !isConnected}
		<button
			on:click={connectCoinbaseWallet}
			class="auth-button create-wallet"
			disabled={isConnecting || disabled}
		>
			<CoinbaseWalletLogo />
			{isConnecting ? 'Connecting...' : 'Create Coinbase Wallet'}
		</button>
		<button
			on:click={connectExistingWallet}
			class="auth-button connect-wallet"
			disabled={isConnecting || disabled}
		>
			{isConnecting ? 'Connecting...' : 'Connect Existing Wallet'}
		</button>
	{:else}
		<button
			on:click={disconnectWallet}
			class="auth-button disconnect-wallet"
			disabled={isConnecting || disabled}
		>
			Disconnect Wallet
		</button>
	{/if}
</div>

<style>
	.wallet-options-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
		padding: 1em 2em;
	}

	.connected-wallet {
		padding: 0.8em 1.5em;

		overflow-wrap: break-word;
	}

	.connect-wallet,
	.create-wallet,
	.disconnect-wallet {
		width: 100%;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 25px;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.connect-wallet {
		background-color: #3a3a3a;
		color: white;
	}

	.create-wallet {
		background-color: #0052ff;
		color: white;
	}

	.create-wallet:hover:not(:disabled) {
		background-color: #0043cc;
	}

	.disconnect-wallet {
		background-color: #ff4136;
		color: white;
	}

	:global(.create-wallet svg) {
		width: 24px;
		height: 24px;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
