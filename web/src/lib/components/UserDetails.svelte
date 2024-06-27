<script>
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import EthereumWalletInput from './EthereumWalletInput.svelte';

	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;

	let primaryEthereumWallet = '';
	let isEditingWallet = false;

	async function fetchUserDetails() {
		const token = await currentUser.getIdToken();
		const res = await fetch(`${PUBLIC_API_BASE_URL}/user`, {
			method: 'GET',
			headers: {
				Authorization: `${token}`
			}
		});
		if (res.status === 200) {
			const userData = await res.json();
			primaryEthereumWallet = userData.primaryEthereumWallet || '';
		}
	}

	/**
	 * @param {{ detail: string; }} event
	 */
	async function updateWalletAddress(event) {
		primaryEthereumWallet = event.detail;
		isEditingWallet = false;
	}

	$: if (currentUser) {
		fetchUserDetails();
	}
</script>

<div class="user-details">
	<h2>User Profile</h2>
	<p><strong>Email:</strong> {currentUser.email}</p>
	<p><strong>Name:</strong> {currentUser.displayName}</p>

	<p>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<strong on:click={() => console.log(JSON.stringify(currentUser, null, 2))}>User ID:</strong>
		{currentUser.uid}
	</p>
	<div class="wallet-section">
		<h3>Ethereum Wallet</h3>
		{#if primaryEthereumWallet && !isEditingWallet}
			<p>{primaryEthereumWallet}</p>
			<button on:click={() => (isEditingWallet = true)}>Edit</button>
		{:else if isEditingWallet}
			<p>{primaryEthereumWallet}</p>
			<EthereumWalletInput on:walletAddressSubmitted={updateWalletAddress} hideInfo={true} />
			<button style:margin-top="2em" on:click={() => (isEditingWallet = false)}>Cancel</button>
		{:else}
			<p>No wallet linked</p>
			<p>
				A wallet compatible with the Zora and Base networks is required to receive the NFTs. If you
				don't have one yet, we suggest using <a
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
			<button on:click={() => (isEditingWallet = true)}>Link Wallet</button>
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
