<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { auth } from '$lib/firebase';
	import BackgroundCanvas from '$lib/components/BackgroundCanvas.svelte';
	import AuthButtons from '$lib/components/AuthButtons.svelte';
	import MintButton from '$lib/components/MintButton.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SidePanel from '$lib/components/SidePanel.svelte';

	let authInitialised = false;
	/**
	 * @type {import("@firebase/auth").User | null}
	 */
	let currentUser = null;
	/**
	 * @type {{ from: any; } | null}
	 */
	let project = null;
	let projectId = '';
	let isMinting = false;
	let mintingComplete = false;
	let mintingInfo = { totalMinted: 0 };
	let hasNfts = true;

	auth.onAuthStateChanged(async (user) => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		currentUser = user;
		authInitialised = true;
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

		await new Promise((resolve) => setTimeout(resolve, 1000));
		if (res.status === 200) {
			const body = await res.json();
			project = body;
		} else if (res.status === 404) {
			console.error('Project not found', res);
			goto('/');
		} else {
			console.error('Error fetching project', res);
		}
	});

	async function mint() {
		if (!currentUser) {
			console.error('No user found');
			return;
		}
		isMinting = true;
		const token = await currentUser.getIdToken(true);
		if (!token) {
			console.error('No token found for user', currentUser);
			isMinting = false;
			return;
		}
		const res = await fetch(`${PUBLIC_API_BASE_URL}/mint`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${token}`
			},
			body: JSON.stringify({ projectId })
		});
		const body = await res.json();
		mintingInfo = { totalMinted: body.totalMinted || 1 };
		isMinting = false;
		mintingComplete = true;
	}

	async function viewNfts() {
		if (!currentUser) {
			console.error('No user found');
			return;
		}
		const token = await currentUser.getIdToken(true);
		if (!token) {
			console.error('No token found for user', currentUser);
			return;
		}
		const res = await fetch(`${PUBLIC_API_BASE_URL}/mints`, {
			method: 'GET',
			headers: {
				Authorization: `${token}`
			}
		});
		const body = await res.json();
		console.log('Got response', body);
		// TODO: Handle the response, perhaps show a modal with the NFTs
	}
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<BackgroundCanvas />

<div class="container">
	<div class="main-content">
		<h1 class="gradient-text" in:fly={{ y: 20, duration: 1000 }}>
			You're eligible for a free NFT! ✨
		</h1>

		{#if authInitialised && currentUser}
			<p class="welcome-text" in:fly={{ y: -20, duration: 1000 }}>
				Welcome, {currentUser.displayName}, you're all set to mint your unique collectible.
			</p>
		{:else if authInitialised}
			<AuthButtons />
		{/if}

		<ProjectCard {project} />

		{#if currentUser && project}
			<MintButton {mint} {isMinting} {mintingComplete} {mintingInfo} />
		{/if}
	</div>

	{#if currentUser}
		<SidePanel {viewNfts} {hasNfts} />
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
		background-color: rgba(var(--background-color-rgb), 0.3);
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
