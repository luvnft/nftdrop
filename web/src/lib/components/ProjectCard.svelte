<script>
	import Loader from './Loader.svelte';
	export let project;
</script>

<div class="project-card">
	{#if project}
		<div class="image-container">
			<img src={project.image} alt={project.title} />
		</div>
		<div class="content content-flex">
			<h2 class="gradient-text">{project.title}</h2>
			<p class="from">From: {project.from}</p>
			<p class="description">{project.description}</p>
			<a href={project.nftLink} target="_blank" rel="noopener noreferrer" class="nft-link"
				>View on Zora</a
			>
		</div>
	{:else}
		<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
			<Loader />
		</div>
	{/if}
</div>

<style>
	.project-card {
		background: var(--card-background);
		backdrop-filter: blur(10px);
		border-radius: 15px;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		width: 100%;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.project-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	}

	.image-container {
		width: 100%;
		height: 250px;
		overflow: hidden;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.project-card:hover .image-container img {
		transform: scale(1.05);
	}

	.content {
		padding: 1.5em;
	}

	.content-flex {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.description {
		margin-bottom: 1em;
		flex-grow: 1; /* This will push the button to the bottom */
	}

	.nft-link {
		display: inline-block;
		background: rgb(86, 60, 217);
		opacity: 0.8;
		color: white;
		padding: 0.5em 1em;
		border-radius: 25px;
		text-decoration: none;
		transition: opacity 0.3s ease;
		align-self: flex-end; /* This will align the button to the right */
	}

	.nft-link:hover {
		opacity: 1;
	}

	.gradient-text {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		font-weight: bold;
		margin-top: 0;
	}

	.from {
		font-style: italic;
		color: var(--accent-color);
		margin-bottom: 0.5em;
	}

	.description {
		margin-bottom: 1em;
	}

	.nft-link {
		display: inline-block;
		background: rgb(86, 60, 217);
		opacity: 0.8;
		color: white;
		padding: 0.5em 1em;
		border-radius: 25px;
		text-decoration: none;
		transition: opacity 0.3s ease;
	}

	.nft-link:hover {
		opacity: 1;
	}
</style>
