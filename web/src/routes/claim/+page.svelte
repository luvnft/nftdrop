<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { auth, checkEmailLink } from '$lib/firebase';
	import BackgroundCanvas from '$lib/components/BackgroundCanvas.svelte';
	import AuthButtons from '$lib/components/AuthButtons.svelte';
	import MintButton from '$lib/components/MintButton.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SidePanel from '$lib/components/SidePanel.svelte';
	import { createMint } from '$lib/api';
	import { getUserAirdropAddress, LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY } from '$lib/localStorage';
	import { initWagmi } from '$lib/wagmi';

	let authInitialised = false;
	/**
	 * @type {import("@firebase/auth").User | null}
	 */
	let currentUser = null;

	/**
	 * @type {any | null}
	 */
	let project = null;
	let projectId = '';
	let isMinting = false;
	let mintingComplete = false;
	/**
	 * @type {any}
	 */
	let claimedAt = undefined;

	/**
	 * @type {string | null}
	 */
	let airdropWalletAddress = null;
	let userAlreadyMinted = false;

	auth.onAuthStateChanged(async (user) => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		currentUser = user;
		authInitialised = true;
		if (user) {
			if (!projectId) {
				console.error('User already found but no project ID');
				return;
			}

			const token = await user.getIdToken();
			const res = await fetch(`${PUBLIC_API_BASE_URL}/project/${projectId}/canMint`, {
				method: 'GET',
				headers: {
					Authorization: `${token}`
				}
			});
			airdropWalletAddress = await getUserAirdropAddress(currentUser);
			if (res.status === 200) {
				const body = await res.json();
				userAlreadyMinted = body.userAlreadyMinted;
				claimedAt = body.claimedAt;
			} else {
				console.error('Error fetching minting status', res);
			}
		} else {
			airdropWalletAddress = '';
			localStorage.removeItem(LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY);
			userAlreadyMinted = false;
		}
	});

	onMount(async () => {
		const id = $page.url.searchParams.get('id');
		if (!id) {
			goto('/');
			return;
		}
		projectId = id;

		const res = await fetch(`${PUBLIC_API_BASE_URL}/project/${id}`, {
			method: 'GET'
		});
		if (res.status === 200) {
			const body = await res.json();
			project = body;
		} else if (res.status === 404) {
			console.error('Project not found', res);
			goto('/');
		} else {
			console.error('Error fetching project', res);
		}

		await checkEmailLink(auth);

		await initWagmi();
	});

	/**
	 * @param {{ detail: string; }} event
	 */
	function walletAddressSubmitted(event) {
		airdropWalletAddress = event.detail;
		localStorage.setItem(LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY, airdropWalletAddress);
	}

	async function mint() {
		if (!currentUser) {
			console.error('No user found');
			return;
		}
		isMinting = true;
		const token = await currentUser.getIdToken();
		if (!token) {
			console.error('No token found for user', currentUser);
			isMinting = false;
			return;
		}
		const res = await createMint(token, projectId);

		if (res.status !== 200) {
			console.error('Error minting', res);
			isMinting = false;
			if ((await res.text()).includes('not open')) {
				location.reload();
			}
			return;
		}
		const body = await res.json();

		project.mintCount = body.mintCount;
		claimedAt = body.claimedAt;

		isMinting = false;
		mintingComplete = true;
	}
</script>

<svelte:head>
	<title>Claim NFT</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<BackgroundCanvas />

<div class="container">
	<div class="main-content">
		<h1 class="gradient-text" in:fly={{ y: 20, duration: 1000 }}>
			{#if project === null || project?.claimOpen}
				You're eligible for a free NFT!
			{:else}
				🚫 Claiming is closed for this project 🚫
			{/if}
		</h1>

		{#if authInitialised && currentUser && !userAlreadyMinted}
			<p class="welcome-text" in:fly={{ y: -20, duration: 1000 }}>
				Welcome, {currentUser.displayName ?? currentUser.email},
				{#if project?.claimOpen}
					you're all set to claim your unique collectible.
				{:else}
					the project admin has closed the claiming for this project.
				{/if}
			</p>
		{:else if authInitialised && !userAlreadyMinted}
			{#if project?.claimOpen}
				<p>Please identify yourself to claim your unique collectible!</p>
			{:else}
				<p>
					Claiming is closed for this project but you can still sign in to make your next claim
					easier!
				</p>
			{/if}
			<AuthButtons />
		{/if}

		<ProjectCard {project} />

		{#if currentUser && project}
			<MintButton
				{mint}
				{isMinting}
				{mintingComplete}
				{claimedAt}
				{userAlreadyMinted}
				{project}
				{currentUser}
				{airdropWalletAddress}
				{walletAddressSubmitted}
			/>
		{/if}
	</div>

	{#if currentUser}
		<SidePanel />
	{/if}
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 2rem;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	h1 {
		font-size: clamp(1.5rem, 5vw, 2.5rem);
		text-align: center;
		margin-bottom: 1em;
	}

	.welcome-text {
		font-size: 1.2em;
		margin: 1em;
	}

	.gradient-text {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		font-weight: bold;
	}

	@media (max-width: 600px) {
		.container {
			padding: 1rem;
		}
	}
</style>
