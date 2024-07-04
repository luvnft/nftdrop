<script>
	import { fetchUserData } from '$lib/api';
	import { LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY } from '$lib/localStorage';
	import EthereumWalletInput from './EthereumWalletInput.svelte';

	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;

	let airdropWalletAddress = '';
	let isEditingWallet = false;

	async function fetchUserDetails() {
		const token = await currentUser.getIdToken();
		const res = await fetchUserData(token);
		if (res.status === 200) {
			const userData = await res.json();
			airdropWalletAddress = userData.airdropWalletAddress || '';
			localStorage.setItem(`${LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY}`, airdropWalletAddress);
		}
	}

	/**
	 * @param {{ detail: string; }} event
	 */
	async function updateWalletAddress(event) {
		airdropWalletAddress = event.detail;
		isEditingWallet = false;
	}

	$: if (currentUser) {
		fetchUserDetails();
	}
</script>

<div class="user-details">
	<h2>User Profile</h2>
	{#if currentUser.email}
		<p><strong>Email:</strong> {currentUser.email}</p>
	{/if}
	{#if currentUser.displayName}
		<p><strong>Name:</strong> {currentUser.displayName}</p>
	{/if}

	<p>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<strong on:click={() => console.log(JSON.stringify(currentUser, null, 2))}>User ID:</strong>
		{currentUser.uid}
	</p>
	<div class="wallet-section">
		<h3>Ethereum Wallet</h3>
		{#if airdropWalletAddress && !isEditingWallet}
			<p>{airdropWalletAddress}</p>
			<button on:click={() => (isEditingWallet = true)}>Edit</button>
		{:else if isEditingWallet}
			<p>{airdropWalletAddress}</p>
			<EthereumWalletInput
				on:walletAddressSubmitted={updateWalletAddress}
				hideInfo={true}
				storedWalletAddress={airdropWalletAddress}
			/>
			<button style:margin-top="2em" on:click={() => (isEditingWallet = false)}>Cancel</button>
		{:else}
			<p>No wallet linked for airdrop</p>
			<EthereumWalletInput on:walletAddressSubmitted={updateWalletAddress} />
		{/if}
	</div>
</div>

<style>
	.user-details {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(6px);
		padding: 2rem;
		border-radius: 15px;
		width: 50vw;
		margin: 0 auto;
	}

	h2,
	h3 {
		color: var(--accent-color);
	}

	p {
		overflow-wrap: break-word;
	}

	.wallet-section {
		margin-top: 2rem;
	}

	button {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 25px;
		cursor: pointer;
		margin-right: 0.5rem;
		transition: opacity 0.3s ease;
	}

	button:hover {
		opacity: 0.9;
	}
</style>
