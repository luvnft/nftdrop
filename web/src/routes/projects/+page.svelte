<script>
	import { initializeApp } from '@firebase/app';
	import { getAuth, signInWithPopup } from '@firebase/auth';
	import { page } from '$app/stores';
	import {
		GoogleAuthProvider,
		EmailAuthProvider,
		FacebookAuthProvider
	} from '@firebase/auth/internal';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { Jumper, Circle3 } from 'svelte-loading-spinners';

	let authInitialised = false;
	/**
	 * @type {null | { title: string, description: string, from: string, nft: string }}
	 */
	let project = null;

	// See: https://firebase.google.com/docs/web/learn-more#config-object
	const firebaseConfig = {
		apiKey: 'AIzaSyALa6V71BIS4zbkdb7dpDigCt8CiicEWY8',
		authDomain: 'nft-surprise.firebaseapp.com',
		projectId: 'nft-surprise',
		storageBucket: 'nft-surprise.appspot.com',
		messagingSenderId: '256932602917',
		appId: '1:256932602917:web:f5439c79f18beae76e0bcc',
		measurementId: 'G-SJY57JX10E'
	};

	// Initialize Firebase
	const app = initializeApp(firebaseConfig);

	// Initialize Firebase Authentication and get a reference to the service
	const auth = getAuth(app);

	/**
	 * @type {import("@firebase/auth").User | null}
	 */
	let currentUser = null;

	auth.onAuthStateChanged(async (user) => {
		// if not production mode, add artificial delay
		await new Promise((resolve) => setTimeout(resolve, 500));
		if (user) {
			currentUser = user;
			console.log('User is signed in', user);
		} else {
			currentUser = null;
			console.log('User is signed out');
		}
		authInitialised = true;
	});

	let projectId = '';

	async function signInWithGoogle() {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	}

	async function signInWithFacebook() {
		const provider = new FacebookAuthProvider();
		await signInWithPopup(auth, provider);
	}

	async function signInWithEmail() {
		const provider = new EmailAuthProvider();
		await signInWithPopup(auth, provider);
	}

	async function signInWithEthereum() {
		// todo
	}

	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let isMinting = false;
	let mintingComplete = false;
	let mintingInfo = { totalMinted: 0 };

	const progress = tweened(0, {
		duration: 1000,
		easing: cubicOut
	});

	async function mint() {
		if (!currentUser) {
			console.error('No user found');
			// TODO show error message
			return;
		}
		isMinting = true;
		progress.set(0);
		const token = await currentUser.getIdToken(true);
		if (!token) {
			console.error('No token found for user', currentUser);
			// TODO show error message
			isMinting = false;
			return;
		}
		progress.set(0.3);
		const res = await fetch(`${PUBLIC_API_BASE_URL}/mint`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${token}`
			},
			body: JSON.stringify({ projectId })
		});
		progress.set(0.6);
		const body = await res.json();
		console.log('Got response', body);
		progress.set(1);
		mintingInfo = { totalMinted: body.totalMinted || 1 };
		isMinting = false;
		mintingComplete = true;
	}

	async function viewNfts() {
		if (!currentUser) {
			console.error('No user found');
			// TODO show error message
			return;
		}
		const token = await currentUser.getIdToken(true);
		if (!token) {
			console.error('No token found for user', currentUser);
			// TODO show error message
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
	}

	// Add these imports for the animation library
	import { fade, fly } from 'svelte/transition';
	import { spring } from 'svelte/motion';

	// Create a spring for the background animation
	const backgroundSpring = spring(
		{ x: 50, y: 50 },
		{
			stiffness: 0.1,
			damping: 0.25
		}
	);

	/**
	 * @type {HTMLCanvasElement}
	 * The canvas element used for rendering the background effect.
	 */
	let canvas;

	/**
	 * @type {CanvasRenderingContext2D | null}
	 * The 2D rendering context for the canvas.
	 */
	let ctx;

	/**
	 * @type {number}
	 * The width of the canvas in pixels.
	 */
	let width;

	/**
	 * @type {number}
	 * The height of the canvas in pixels.
	 */
	let height;

	/**
	 * @type {Array<{
	 *   x: number,
	 *   y: number,
	 *   radius: number,
	 *   speed: number,
	 *   alpha: number,
	 *   direction: number,
	 *   brightness: number
	 * }>}
	 * An array of particle objects, each representing a point in the background effect.
	 */
	let particles = [];

	/**
	 * @type {{x: number, y: number}}
	 * An object representing the current mouse position on the canvas.
	 */
	let mouse = { x: 0, y: 0 };

	/**
	 * @type {CanvasGradient}
	 * A gradient object used for coloring the particles.
	 */
	let gradient;

	onMount(async () => {
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;
		ctx = canvas.getContext('2d');

		if (!ctx) return;

		for (let i = 0; i < 100; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				radius: Math.random() * 2 + 1,
				speed: 0.1 + Math.random() * 0.5,
				brightness: Math.random(),
				alpha: 0.1 + Math.random() * 0.3,
				direction: Math.random() * Math.PI * 2
			});
		}

		animate();

		const id = $page.url.searchParams.get('id');
		if (!id) {
			goto('/');
			return;
		}
		projectId = id;

		const res = await fetch(`${PUBLIC_API_BASE_URL}/project/${id}`, {
			method: 'GET'
		});

		// if not production mode, add artificial delay
		await new Promise((resolve) => setTimeout(resolve, 1000));
		if (res.status === 200) {
			const body = await res.json();
			console.log('Got response', body);
			project = body;
			return;
		}
		if (res.status === 404) {
			console.error('Project not found', res);
			goto('/');
			return;
		}
		console.error('Error fetching project', res);
		console.log('Mounted');
	});

	function animate() {
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);

		for (let particle of particles) {
			// Move the particle
			particle.x += Math.cos(particle.direction) * particle.speed;
			particle.y += Math.sin(particle.direction) * particle.speed;

			// Wrap around the screen
			if (particle.x < 0) particle.x = width;
			if (particle.x > width) particle.x = 0;
			if (particle.y < 0) particle.y = height;
			if (particle.y > height) particle.y = 0;

			// Pulsating effect
			particle.alpha = 0.1 + Math.abs(Math.sin(Date.now() * 0.001 * particle.speed)) * 0.3;

			// Draw the particle
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
			ctx.fillStyle = `hsla(${60 + particle.brightness * 30}, 100%, ${50 + particle.brightness * 50}%, ${particle.alpha})`;
			ctx.fill();
		}

		requestAnimationFrame(animate);
	}

	/**
	 * @param {{ clientX: number; clientY: number; }} event
	 */
	function handleMouseMove(event) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<svelte:window on:mousemove={handleMouseMove} />

<canvas bind:this={canvas} class="background-canvas"></canvas>

<div class="container">
	<div class="main-content">
		<h1 class="gradient-text" in:fly={{ y: 20, duration: 1000 }}>
			You're getting a free NFT from {project?.from ?? '...'}!
		</h1>

		<div class="project-card" in:fade={{ duration: 1000 }}>
			{#if project}
				<h2 class="gradient-text">{project.title}</h2>
				<p>{project.description}</p>
			{:else}
				<Circle3 size="60" unit="px" duration="1s" />
			{/if}
		</div>

		{#if !authInitialised}
			<p><Jumper size="60" color="var(--accent-color)" unit="px" duration="1s" /></p>
		{:else if currentUser !== null}
			<p class="welcome-text" in:fly={{ y: -20, duration: 1000 }}>
				Welcome, {currentUser.displayName}, you're all set to mint your unique collectible.
			</p>
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
				<div class="minting-complete" in:fly={{ y: -20, duration: 1000 }}>
					<h3>🎉 Congratulations!</h3>
					<p>You've successfully minted your NFT.</p>
					<p>Total NFTs minted in this project: {mintingInfo.totalMinted}</p>
				</div>
			{/if}
		{:else}
			<div class="auth-container" in:fade={{ duration: 1000 }}>
				<p>Please identify yourself to mint your unique collectible!</p>
				<button on:click={signInWithGoogle} class="auth-button google">Sign in with Google</button>
				<button disabled={true} on:click={signInWithFacebook} class="auth-button facebook">
					<img src="../facebook.svg" alt="Facebook" />
					Sign in with Facebook
				</button>
				<button disabled={true} on:click={signInWithEmail} class="auth-button email">
					Sign in with Email
				</button>
				<button disabled={true} on:click={signInWithEthereum} class="auth-button ethereum">
					Sign in with Ethereum
				</button>
			</div>
		{/if}
	</div>

	{#if currentUser !== null}
		<div class="side-panel">
			<button on:click={viewNfts} class="secondary-button">View your NFTs</button>
			<button on:click={() => auth.signOut()} class="signout-button">Sign out</button>
		</div>
	{/if}
</div>

<style>
	:root {
		--background-color: #ffffff;
		--background-color-rgb: 255, 255, 255;
		--text-color: #333333;
		--card-background: rgba(255, 255, 255, 0.1);
		--accent-color: #4285f4;
		--gradient-start: #30cfd0;
		--gradient-end: #330867;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--background-color: #1a1a1a;
			--background-color-rgb: 26, 26, 26;
			--text-color: #f0f0f0;
			--card-background: rgba(255, 255, 255, 0.05);
			--accent-color: #64b5f6;
			--gradient-start: #64b5f6;
			--gradient-end: #c2185b;
		}
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu,
			Cantarell, 'Helvetica Neue', sans-serif;
		background-color: var(--background-color);
		color: var(--text-color);
		line-height: 1.5;
		font-size: 16px;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		overflow: hidden;
	}

	.background-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		opacity: 1;
		background: radial-gradient(ellipse at bottom, #ffffff 0%, #c3c3c3 100%);
	}

	@media (prefers-color-scheme: dark) {
		.background-canvas {
			background: radial-gradient(ellipse at bottom, #121a23 0%, #020304 100%);
		}
	}

	.container {
		min-height: 100vh;
		display: flex;

		flex-direction: column;
		padding: 1rem;
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

	.side-panel {
		margin-top: 2rem;
		top: 1rem;
		right: 1rem;
		gap: 1rem;
		display: flex;
		flex-direction: row;
		position: static;
		justify-content: center;
	}

	.gradient-text {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		font-weight: bold;
	}

	h1 {
		font-size: clamp(1.5rem, 5vw, 2.5rem);
		text-align: center;
		margin-bottom: 1em;
	}

	.project-card {
		background: var(--card-background);
		backdrop-filter: blur(10px);
		border-radius: 15px;
		padding: 2em;
		margin: 1em;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		width: 80%;
	}

	.welcome-text {
		font-size: 1.2em;
		margin: 1em 0;
	}

	.primary-button,
	.secondary-button,
	.signout-button,
	.auth-button {
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

	.primary-button {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		padding: 1em 2em;
		font-size: 1.2rem;
		margin-top: 2em;
		position: relative;
		overflow: hidden;
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

	.secondary-button,
	.signout-button {
		background: var(--gradient-start);
		color: white;
		padding: 0.6em 1em;
		font-size: 0.9rem;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.secondary-button:hover,
	.signout-button:hover {
		opacity: 1;
	}

	.signout-button {
		background: var(--gradient-end);
	}

	.auth-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
		width: 100%;
		max-width: 300px;
	}

	.auth-button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
	}

	.auth-button img {
		width: 1.5em;
		height: 1.5em;
	}

	.auth-button.google {
		background-color: #db4437;
		color: white;
	}
	.auth-button.facebook {
		background-color: #4267b2;
		color: white;
	}
	.auth-button.email {
		background-color: #4285f4;
		color: white;
	}
	.auth-button.ethereum {
		background-color: #3c3c3d;
		color: white;
	}

	button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		.container {
			padding: 1rem;
		}

		.auth-button {
			width: 100%;
		}
	}
</style>
