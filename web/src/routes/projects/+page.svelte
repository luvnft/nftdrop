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

	let projectId = '';
	beforeUpdate(() => {
		const id = $page.url.searchParams.get('id');
		if (!id) {
			goto('/');
			return;
		}
		projectId = id;
		console.log(projectId);
	});

	const signInWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const signInWithFacebook = async () => {
		const provider = new FacebookAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const signInWithEmail = async () => {
		const provider = new EmailAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const signInWithEthereum = async () => {
		// todo
	};
</script>

<div
	style:display="flex"
	style:flex-direction="column"
	style:align-items="center"
	style:justify-items="center"
	style:max-height="100vh"
>
	<h1 style:margin="1em">You're getting a free NFT from {projectId}!</h1>
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
		on:click={signInWithFacebook}
		style="background-color: #4267B2; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-bottom: 0.5em;"
	>
		<img
			src="facebook.svg"
			alt="Facebook"
			style="width: 20px; height: 20px; margin-right: 0.5em;"
		/>
		Sign in with Facebook
	</button>
	<button
		on:click={signInWithEmail}
		style="background-color: #4285F4; color: white; padding: 0.5em 1em; border: none; border-radius: 0.25em; margin-bottom: 0.5em;"
	>
		<!-- <img src="email-icon.png" alt="Email" style="width: 20px; height: 20px; margin-right: 0.5em;" /> -->
		Sign in with Email
	</button>
	<button
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
