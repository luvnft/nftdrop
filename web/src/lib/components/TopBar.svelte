<script>
	import { createEventDispatcher } from 'svelte';
	import { auth } from '$lib/firebase';

	export let currentUser;
	export let setActiveSection;

	const dispatch = createEventDispatcher();

	function signOut() {
		auth.signOut();
		dispatch('signout');
	}
</script>

<header>
	<nav>
		<div class="logo">
			<img src="../mintwave.svg" alt="Mint Wave" class="icon-inline" />Mint Wave
		</div>
		{#if currentUser}
			<ul>
				<li>
					<button on:click={() => setActiveSection('profile')}>Profile</button>
				</li>
				<li class="projects-button">
					<button on:click={() => setActiveSection('projects')}>Projects</button>
				</li>
				<li>
					<button on:click={() => setActiveSection('nfts')}>My NFTs</button>
				</li>
				<li>
					<button on:click={signOut} class="sign-out">Sign Out</button>
				</li>
			</ul>
		{/if}
	</nav>
</header>

<style>
	header {
		padding: 1rem 5%;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(6px);
		position: sticky;
		top: 0;
		width: 90%;
		z-index: 1000;
	}

	@media (prefers-color-scheme: dark) {
		header {
			background: rgba(255, 255, 255, 0);
		}
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: bold;
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.icon-inline {
		width: 2em;
		height: 2em;
		padding-bottom: 0.2em;
		padding-right: 0.24em;
	}

	ul {
		display: flex;
		list-style-type: none;
		margin: 0;
		padding: 0;
	}

	li {
		margin-left: 1rem;
	}

	button {
		background: none;
		border: none;
		color: var(--text-color);
		cursor: pointer;
		font-size: 1rem;
		padding: 0.5rem 1rem;
		transition: color 0.3s ease;
	}

	button:hover {
		color: var(--accent-color);
	}

	.sign-out {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		border-radius: 25px;
	}

	.sign-out:hover {
		opacity: 0.9;
	}

	/* Hide projects button on mobile */
	@media (max-width: 768px) {
		.projects-button {
			display: none;
		}
	}

	@media (max-width: 768px) {
		ul {
			flex-direction: column;
			align-items: flex-end;
		}

		li {
			margin-left: 0;
			margin-top: 0.5rem;
		}
	}
</style>
