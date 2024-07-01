<script>
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import * as api from '$lib/api';
	import { networksAndContracts } from '$lib/contracts';
	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;

	/**
	 * @type {{ network: import("../contracts").Network; contractVersion: number; id: string; contractAddress: string; title: string; from: string; nftContractAddress: string; tokenId: string; image: string; description: string; trackerContractAddress: string, trackerContractVersion: number}}
	 */
	export let project;

	const dispatch = createEventDispatcher();

	let editedProject = { ...project };
	let selectedNetwork = project.network ?? 'baseMainnet';
	let isSaving = false;

	async function saveProject() {
		isSaving = true;
		const updatedProject = {
			...editedProject,
			network: selectedNetwork,
			trackerContractVersion:
				networksAndContracts[selectedNetwork].contracts.NFTAirdropTracker.latest.version,
			trackerContractAddress:
				networksAndContracts[selectedNetwork].contracts.NFTAirdropTracker.latest.address
		};

		const token = await currentUser.getIdToken();
		const res = await api.updateProject(token, project.id, updatedProject);

		if (res.status === 200) {
			const updatedProjectData = await res.json();
			dispatch('projectUpdated', updatedProjectData);
		} else {
			alert('Failed to update project');
		}

		isSaving = false;
	}

	function closeModal() {
		dispatch('close');
	}

	onMount(() => {
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		document.body.style.overflow = '';
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={closeModal} transition:fade={{ duration: 200 }}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-content" on:click|stopPropagation>
		<h2>Edit Project</h2>
		<form on:submit|preventDefault={saveProject}>
			<!-- <div class="form-group">
				<label for="network">Network and Contract Version</label>
				<select id="network" bind:value={selectedNetwork}>
					{#each Object.entries(networksAndContracts) as [network, info]}
						<option value={network}>
							{info.displayName} – NFTAirdropTracker contract v{info.contracts.NFTAirdropTracker
								.latest.version}
						</option>
					{/each}
				</select>
				<p class="selected-info">
					Currently selected: {networksAndContracts[project.network].displayName} – NFTAirdropTracker
					contract v{networksAndContracts[project.network].contracts.NFTAirdropTracker.latest
						.version}
				</p>
			</div> -->

			<div class="form-group">
				<label for="title">NFT Title</label>
				<input id="title" type="text" bind:value={editedProject.title} required />
			</div>

			<div class="form-group">
				<label for="from">Airdrop from (your signature)</label>
				<input id="from" type="text" bind:value={editedProject.from} required />
			</div>

			<div class="form-group">
				<label for="nftContractAddress">Collection of the NFT on Zora.co (ERC-1155 Address)</label>
				<input
					id="nftContractAddress"
					type="text"
					bind:value={editedProject.nftContractAddress}
					required
				/>
			</div>

			<div class="form-group">
				<label for="tokenId">Edition number of the NFT on Zora.co (ERC-1155 Token ID)</label>
				<input id="tokenId" type="text" bind:value={editedProject.tokenId} required />
			</div>

			<div class="form-group">
				<label for="image">Link to image (will be shown on this site)</label>
				<input id="image" type="text" bind:value={editedProject.image} required />
			</div>

			<div class="form-group">
				<label for="description">NFT Description</label>
				<textarea id="description" bind:value={editedProject.description} required></textarea>
			</div>

			<div class="button-group">
				<button type="submit" class="btn btn-primary" disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</button>
				<button type="button" class="btn btn-secondary" on:click={closeModal}>Cancel</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		backdrop-filter: blur(6px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10000;
	}

	.modal-content {
		background: var(--background-color);
		padding: 2rem;
		border-radius: 15px;
		width: 90%;
		max-width: 741px;
		height: 75vh;
		margin: 15vh 0 10vh 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	form {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow-y: auto;
	}

	h2 {
		color: var(--accent-color);
		margin-bottom: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: bold;
		color: var(--accent-color);
	}

	input,
	textarea
	/* select */ {
		width: 90%;
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--accent-color);
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-color);
		font-size: 1rem;
	}

	/* .selected-info {
		font-size: 0.9rem;
		color: var(--text-color);
		opacity: 0.8;
		margin-top: 0.25rem;
	} */

	textarea {
		height: 100px;
		resize: vertical;
	}

	.button-group {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 25px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
	}

	.btn-primary {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.2);
		color: var(--text-color);
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
