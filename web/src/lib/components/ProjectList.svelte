<script>
	import { goto } from '$app/navigation';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { onMount } from 'svelte';

	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;

	/**
	 * @type {any[]}
	 */
	let projects = [];
	let newProjectName = '';
	let newProjectDescription = '';
	let isCreatingProject = false;

	onMount(() => {
		if (currentUser) {
			fetchProjects();
		}
	});

	async function fetchProjects() {
		const token = await currentUser.getIdToken(true);
		const res = await fetch(`${PUBLIC_API_BASE_URL}/projects`, {
			method: 'GET',
			headers: {
				Authorization: `${token}`
			}
		});
		if (res.status === 200) {
			projects = await res.json();
		}
	}

	async function createProject() {
		isCreatingProject = true;
		const token = await currentUser.getIdToken(true);
		const res = await fetch(`${PUBLIC_API_BASE_URL}/projects`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${token}`
			},
			body: JSON.stringify({ name: newProjectName, description: newProjectDescription })
		});
		if (res.status === 200) {
			const newProject = await res.json();
			projects = [...projects, newProject];
			newProjectName = '';
			newProjectDescription = '';
		}
		isCreatingProject = false;
	}

	/**
	 * @param {string} projectId
	 */
	async function deleteProject(projectId) {
		if (confirm('Are you sure you want to delete this project?')) {
			const token = await currentUser.getIdToken(true);
			const res = await fetch(`${PUBLIC_API_BASE_URL}/projects/${projectId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `${token}`
				}
			});
			if (res.status === 200) {
				projects = projects.filter((project) => project.id !== projectId);
			}
		}
	}

	$: if (currentUser) {
		fetchProjects();
	}
</script>

<div class="project-list">
	<h2>Your NFT Projects</h2>

	<div class="create-project">
		<h3>Create New Project</h3>
		<input type="text" bind:value={newProjectName} placeholder="Project Name" />
		<textarea bind:value={newProjectDescription} placeholder="Project Description"></textarea>
		<button on:click={createProject} disabled={isCreatingProject}>
			{isCreatingProject ? 'Creating...' : 'Create Project'}
		</button>
	</div>

	{#if projects.length > 0}
		<ul>
			{#each projects as project (project.id)}
				<li>
					<div class="project-info">
						<h3>{project.name}</h3>
						<p>{project.description}</p>
						<p>Mint Count: {project.mintCount || 0}</p>
					</div>
					<div class="project-actions">
						<a href="/app/project/{project.id}" class="view-project">View Project</a>
						<button on:click={() => deleteProject(project.id)} class="delete-project">Delete</button
						>
						{#if project.qrCode}
							<button on:click={() => goto(`/qr/?id=${project.id}`)} class="download-qr"
								>See QR</button
							>
						{/if}
					</div>
					{#if project.qrCode}
						<img src={project.qrCode} alt="Project QR Code" class="qr-code" />
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p>You haven't created any projects yet.</p>
	{/if}
</div>

<style>
	.project-list {
		max-width: 800px;
		margin: 0 auto;
	}

	h2,
	h3 {
		color: var(--accent-color);
	}

	.create-project {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(6px);
		padding: 1rem;
		border-radius: 15px;
		margin-bottom: 2rem;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.5rem;
		margin-bottom: 1rem;
		border-radius: 5px;
		border: 1px solid var(--accent-color);
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-color);
	}

	textarea {
		height: 100px;
		resize: vertical;
	}

	button {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 25px;
		cursor: pointer;
		transition: opacity 0.3s ease;
	}

	button:hover:not(:disabled) {
		opacity: 0.9;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(6px);
		padding: 1rem;
		border-radius: 15px;
		margin-bottom: 1rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
	}

	.project-info {
		flex: 1;
		min-width: 200px;
	}

	.project-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.view-project,
	.delete-project,
	.download-qr {
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 25px;
		transition: opacity 0.3s ease;
	}

	.view-project {
		background: var(--accent-color);
		color: white;
	}

	.delete-project {
		background: #ff4136;
		color: white;
	}

	.download-qr {
		background: #2ecc40;
		color: white;
	}

	.qr-code {
		max-width: 150px;
		margin-top: 1rem;
	}

	@media (max-width: 600px) {
		li {
			flex-direction: column;
			align-items: flex-start;
		}

		.project-actions {
			margin-top: 1rem;
		}
	}
</style>
