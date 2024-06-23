<script>
	import { initializeApp } from '@firebase/app';
	import { getAuth, signInWithPopup } from '@firebase/auth';
	import { page } from '$app/stores';
	import {
		GoogleAuthProvider,
		EmailAuthProvider,
		FacebookAuthProvider
	} from '@firebase/auth/internal';
	import { beforeUpdate } from 'svelte';
	import { goto } from '$app/navigation';

	const API_BASE_URL = 'http://localhost:3000';

	// TODO: Replace the following with your app's Firebase project configuration
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

	auth.onAuthStateChanged((user) => {
		if (user) {
			currentUser = user;
			console.log('User is signed in', user);
		} else {
			currentUser = null;
			console.log('User is signed out');
		}
	});

	let projectId = '';
	beforeUpdate(() => {
		const id = $page.url.searchParams.get('id');
		if (!id) {
			goto('/');
			return;
		}
		projectId = id;
	});

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

	async function mint() {
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
		const res = await fetch(`${API_BASE_URL}/mint`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${token}`
			},
			body: JSON.stringify({ projectId })
		});
		const body = await res.json();
		console.log('Got response', body);
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
		const res = await fetch(`${API_BASE_URL}/mints`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${token}`
			}
		});
		const body = await res.json();
		console.log('Got response', body);
	}
</script>

<div
	style:display="flex"
	style:flex-direction="column"
	style:align-items="center"
	style:justify-items="center"
	style:max-height="100vh"
>
	<h1 style:margin="1em">You're getting a free NFT from {projectId}!</h1>

	{#if currentUser !== null}
		<p>
			Welcome, {currentUser.displayName}! You're all set to mint your unique collectible.
		</p>
		<button
			on:click={mint}
			style="background-color: #3C3C3D; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-top: 1em;"
		>
			Mint NFT
		</button>
		<button
			on:click={viewNfts}
			style="background-color: #3C3C3D; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-top: 1em;"
		>
			View your NFTs
		</button>
		<button
			on:click={() => {
				console.log('Signing out');
				auth.signOut();
			}}
			style="background-color: #DB4437; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-top: 1em;"
		>
			Sign out
		</button>
	{:else}
		<div style:display="flex" style:flex-direction="column">
			<p>Please identify yourself to mint your unique collectible!</p>
			<button
				on:click={signInWithGoogle}
				style="background-color: #DB4437; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-bottom: 0.5em;"
			>
				<!-- <img
			src="google-icon.png"
			alt="Google"
			style="width: 20px; height: 20px; margin-right: 0.5em;"
		/> -->
				Sign in with Google
			</button>
			<button
				disabled={true}
				on:click={signInWithFacebook}
				style="background-color: #4267B2; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-bottom: 0.5em;"
			>
				<img
					src="../facebook.svg"
					alt="Facebook"
					style="width: 1em; height: 1em; margin-right: 0.5em;"
				/>
				Sign in with Facebook
			</button>
			<button
				disabled={true}
				on:click={signInWithEmail}
				style="background-color: #4285F4; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-bottom: 0.5em;"
			>
				<!-- <img src="email-icon.png" alt="Email" style="width: 20px; height: 20px; margin-right: 0.5em;" /> -->
				Sign in with Email
			</button>
			<button
				disabled={true}
				on:click={signInWithEthereum}
				style="background-color: #3C3C3D; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-bottom: 0.5em;"
			>
				<!-- <img
			src="eth-icon.png"
			alt="Ethereum"
			style="width: 20px; height: 20px; margin-right: 0.5em;"
		/> -->
				Sign in with Ethereum
			</button>
		</div>
	{/if}
</div>
