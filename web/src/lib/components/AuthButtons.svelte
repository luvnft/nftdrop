<script>
	export let claimOpen = true;

	import { auth } from '$lib/firebase';
	import {
		signInWithPopup,
		GoogleAuthProvider,
		FacebookAuthProvider,
		EmailAuthProvider
	} from '@firebase/auth';

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
		// TODO: Implement Ethereum sign-in
	}
</script>

<div class="auth-container">
	{#if claimOpen}
		<p>Please identify yourself to mint your unique collectible!</p>
	{:else}
		<p>
			Claiming is closed for this project but you can still sign in to make your next claim easier!
		</p>
	{/if}
	<button on:click={signInWithGoogle} class="auth-button google">Sign in with Google</button>
	<button disabled={true} on:click={signInWithFacebook} class="auth-button facebook">
		Sign in with Facebook
	</button>
	<button disabled={true} on:click={signInWithEmail} class="auth-button email">
		Sign in with Email
	</button>
	<button disabled={true} on:click={signInWithEthereum} class="auth-button ethereum">
		Sign in with Ethereum
	</button>
</div>

<style>
	.auth-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
		width: 100%;
		max-width: 300px;
		margin-bottom: 4em;
	}

	.auth-button {
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
</style>
