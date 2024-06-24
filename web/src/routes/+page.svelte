<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	/**
	 * @type {HTMLDivElement}
	 */
	let background;

	onMount(() => {
		for (let i = 0; i < 50; i++) {
			const particle = document.createElement('div');
			particle.classList.add('particle');
			background.appendChild(particle);

			gsap.set(particle, {
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				scale: Math.random() * 0.5 + 0.5
			});

			animateParticle(particle);
		}
	});

	/**
	 * @param {gsap.TweenTarget} particle
	 */
	function animateParticle(particle) {
		gsap.to(particle, {
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			duration: Math.random() * 10 + 5,
			ease: 'none',
			onComplete: () => animateParticle(particle)
		});
	}
</script>

<svelte:head>
	<title>Mint Wave - Seamless Digital Memorabilia</title>
</svelte:head>

<div class="background-animation" bind:this={background}></div>

<header>
	<nav>
		<div class="logo">Mint Wave</div>
		<ul>
			<li><a href="#features">Features</a></li>
			<li><a href="#how-it-works">How It Works</a></li>
			<li><a href="#about">About</a></li>
			<li><a href="/profile" class="cta-button">Launch App</a></li>
		</ul>
	</nav>
</header>

<main>
	<section id="hero">
		<h1>Collect & Share Digital Memories<br />with Ease</h1>
		<p class="hero-text">Delight your event visitors with a unique, ownable and tradable NFT</p>
	</section>

	<section id="features">
		<h2>Features</h2>
		<div class="feature-grid">
			<div class="feature-card">
				<img src="airdrop-icon.svg" alt="Airdrop" class="icon" />
				<h3>Airdrop NFTs</h3>
				<p>Easily create and manage your NFT airdrop</p>
			</div>
			<div class="feature-card">
				<img src="qr-code-icon.svg" alt="QR Code" class="icon" />
				<h3>Quick Collect</h3>
				<p>Allow people to collect the NFT by scanning a QR code</p>
			</div>
			<div class="feature-card">
				<img src="wallet-icon.svg" alt="Wallet" class="icon" />
				<h3>Wallet Integration</h3>
				<p>Seamlessly connect your wallet, before or after signing up for the airdrop</p>
			</div>
			<div class="feature-card">
				<img src="gallery-icon.svg" alt="Gallery" class="icon" />
				<h3>View NFTs</h3>
				<p>Check-up on the airdrops you signed up for</p>
			</div>
		</div>
	</section>

	<section id="how-it-works">
		<h2>Creating a NFT Airdrop – How It Works</h2>
		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<h3>Create Your NFT</h3>
				<p>Design and create the NFT you want to share with your event visitors on Zora</p>
			</div>
			<div class="step">
				<div class="step-number">2</div>
				<h3>Create Your Airdrop</h3>
				<p>Fill a short form to create your unique airdrop page and the QR code that leads to it</p>
			</div>
			<div class="step">
				<div class="step-number">3</div>
				<h3>Share the QR Code</h3>
				<p>
					Print or display the QR code at your event so that visitors can easily scan it and join
					the airdrop
				</p>
			</div>
			<div class="step">
				<div class="step-number">4</div>
				<h3>Airdrop the NFT</h3>
				<p>After the event, send the NFT to everyone who signed up</p>
			</div>
		</div>
	</section>

	<section id="how-it-works">
		<h2>Collecting a NFT – How It Works</h2>
		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<h3>Attend an Event</h3>
				<p>Go to participating concerts, festivals, or parties</p>
			</div>
			<div class="step">
				<div class="step-number">2</div>
				<h3>Scan QR Code</h3>
				<p>Look for the event's unique QR code and open it with your phone camera</p>
			</div>
			<div class="step">
				<div class="step-number">3</div>
				<h3>Identify Yourself</h3>
				<p>
					Quickly create an account through our 3rd party integrations: Google, X, Facebook,
					Ethereum
				</p>
			</div>
			<div class="step">
				<div class="step-number">4</div>
				<h3>Collect NFT</h3>
				<p>Sign up for the NFT airdrop and link your wallet address to receive the airdrop</p>
			</div>
		</div>
	</section>

	<section id="about">
		<h2>About Mint Wave</h2>
		<p>
			Mint Wave revolutionizes how we capture and own digital memories from live events. Our
			platform bridges the gap between physical experiences and digital ownership, allowing
			event-goers to collect unique, blockchain-verified memorabilia with just a scan.
		</p>
		<div class="cta-container">
			<a href="/profile" class="cta-button large">Join the Revolution</a>
		</div>
	</section>
</main>

<footer>
	<p>&copy; 2024 reksa</p>
</footer>

<style>
	:root {
		--background-color: #ffffff;
		--text-color: #333333;
		--accent-color: #4285f4;
		--gradient-start: #30cfd0;
		--gradient-end: #330867;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--background-color: #1a1a1a;
			--text-color: #f0f0f0;
			--accent-color: #64b5f6;
		}
	}

	:global(body) {
		font-family: 'Arial', sans-serif;
		margin: 0;
		padding: 0;
		background-color: var(--background-color);
		color: var(--text-color);
		overflow-x: hidden;
	}

	.background-animation {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		opacity: 0.1;
	}

	header {
		padding: 1rem 5%;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		position: fixed;
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
		font-size: 1.5rem;
		font-weight: bold;
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	nav ul {
		display: flex;
		list-style-type: none;
	}

	nav ul li {
		margin-left: 2rem;
	}

	nav ul li a {
		text-decoration: none;
		color: var(--text-color);
		transition: color 0.3s ease;
	}

	nav ul li a:hover {
		color: var(--accent-color);
	}

	.cta-container {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}

	.cta-button.large {
		font-size: 1.2rem;
		padding: 0.8rem 1.5rem;
	}

	.cta-button {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 25px;
		text-decoration: none;
		transition: opacity 0.3s ease;
	}

	.cta-button:hover {
		opacity: 0.9;
	}

	@media (prefers-color-scheme: dark) {
		.icon {
			filter: invert(1) brightness(2);
		}
	}

	main {
		padding-top: 80px;
	}

	section {
		padding: 4rem 10%;
	}

	h1,
	h2 {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 3rem;
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-text {
		text-align: center;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 15px;
		text-align: center;
		transition: transform 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-10px);
	}

	.feature-card img {
		width: 64px;
		height: 64px;
		margin-bottom: 1rem;
	}

	.steps {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.step {
		flex-basis: 22%;
		text-align: center;
		position: relative;
	}

	.step-number {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 auto 1rem;
	}

	footer {
		text-align: center;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
	}

	@media (max-width: 768px) {
		nav ul {
			display: none;
		}

		.feature-grid,
		.steps {
			grid-template-columns: 1fr;
		}

		.step {
			flex-basis: 100%;
			margin-bottom: 2rem;
		}
	}
</style>
