<script>
	import { auth } from '$lib/firebase';
	import {
		signInWithPopup,
		GoogleAuthProvider,
		TwitterAuthProvider,
		sendSignInLinkToEmail
	} from '@firebase/auth';

	let email = '';
	let isLoading = false;
	let showEmailInput = false;
	let notification = '';

	async function signInWithGoogle() {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	}

	async function signInWithTwitter() {
		const provider = new TwitterAuthProvider();
		await signInWithPopup(auth, provider);
	}

	async function signInWithEmail() {
		if (!email) {
			notification = 'Please enter a valid email address.';
			return;
		}
		isLoading = true;
		try {
			const actionCodeSettings = {
				url: window.location.href,
				handleCodeInApp: true
			};
			await sendSignInLinkToEmail(auth, email, actionCodeSettings);
			notification = 'Check your email for the sign-in link!';
			localStorage.setItem('emailForSignIn', email);
		} catch (error) {
			notification = 'Error sending sign-in link. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	async function signInWithEthereum() {
		// TODO: Implement Ethereum sign-in
	}

	function resetView() {
		showEmailInput = false;
		email = '';
		notification = '';
	}
</script>

<div class="auth-container">
	{#if !showEmailInput}
		<button on:click={signInWithGoogle} class="auth-button google">Sign in with Google</button>
		<button on:click={signInWithTwitter} class="auth-button twitter">Sign in with Twitter</button>
		<button on:click={() => (showEmailInput = true)} class="auth-button email">
			Sign in with Email
		</button>
		<button disabled={true} on:click={signInWithEthereum} class="auth-button ethereum">
			Sign in with Ethereum
		</button>
	{:else}
		<div class="email-input-container">
			<input
				name="email"
				id="email"
				type="email"
				bind:value={email}
				placeholder="Enter your email"
				class="email-input"
			/>
			<button on:click={signInWithEmail} class="auth-button email" disabled={isLoading}>
				{#if isLoading}
					<span class="loader"></span>
					Sending Link
				{:else}
					Send Sign-in Link
				{/if}
			</button>
			<button on:click={resetView} class="auth-button cancel"> Cancel </button>
		</div>
	{/if}
	{#if notification}
		<div class="notification">
			{notification}
		</div>
	{/if}
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
	.auth-button.twitter {
		background-color: #1da1f2;
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
	.auth-button.cancel {
		background-color: #f0f0f0;
		color: #333;
	}

	button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.email-input-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		align-items: center;
	}

	.email-input {
		width: 100%;
		padding: 0.8em;
		border: 1px solid #ccc;
		border-radius: 25px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	.loader {
		border: 2px solid #f3f3f3;
		border-top: 2px solid #3498db;
		border-radius: 50%;
		width: 16px;
		height: 16px;
		animation: spin 1s linear infinite;
		display: inline-block;
		margin-right: 8px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.notification {
		margin-top: 1em;
		padding: 0.8em;
		border-radius: 25px;
		background-color: #f0f0f0;
		color: black;
		text-align: center;
		font-size: 0.9rem;
		width: 100%;
		box-sizing: border-box;
	}
</style>
