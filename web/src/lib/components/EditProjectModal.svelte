<script>
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import * as api from '$lib/api';
	import { networksAndContracts } from '$lib/contracts';
	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;

	/**
	 * @type {{ network: import("../contracts").Network; contractVersion: number; id: string; contractAddress: string; title: string; from: string; nftContractAddress: string; tokenId: string; image: string; description: string;}}
	 */
	export let project;

	const dispatch = createEventDispatcher();

	let editedProject = { ...project };
	let selectedNetwork = project.network;
	let selectedContractVersion = project.contractVersion;
	let selectedContractAddress = project.contractAddress;
	let isSaving = false;

	async function saveProject() {
		isSaving = true;
		const updatedProject = {
			...editedProject,
			network: selectedNetwork,
			contractVersion: selectedContractVersion,
			contractAddress: selectedContractAddress
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
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={closeModal} transition:fade={{ duration: 200 }}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-content" on:click|stopPropagation>
		<h2>Edit Project</h2>
		<form on:submit|preventDefault={saveProject}>
			<select bind:value={selectedNetwork}>
				{#each Object.entries(networksAndContracts) as [network, info]}
					<option value={network}
						>{info.displayName}
						– NFTAirdropTracker contract v{networksAndContracts[selectedNetwork].contracts
							.NFTAirdropTracker.latest.version}</option
					>
				{/each}
			</select>
			<input type="text" bind:value={editedProject.title} placeholder="NFT Title" required />
			<input
				type="text"
				bind:value={editedProject.from}
				placeholder="Airdrop from (your signature)"
				required
			/>
			<input
				type="text"
				bind:value={editedProject.nftContractAddress}
				placeholder="Collection of the NFT on Zora.co (ERC-1155 Address)"
				required
			/>
			<input
				type="text"
				bind:value={editedProject.tokenId}
				placeholder="Edition number of the NFT on Zora.co (ERC-1155 Token ID)"
				required
			/>
			<input
				type="text"
				bind:value={editedProject.image}
				placeholder="Link to image (will be shown on this site)"
				required
			/>
			<textarea bind:value={editedProject.description} placeholder="NFT Description" required
			></textarea>

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
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: var(--background-color);
		padding: 2rem;
		border-radius: 15px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	h2 {
		color: var(--accent-color);
		margin-bottom: 1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	input,
	textarea,
	select {
		width: 100%;
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--accent-color);
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-color);
		font-size: 1rem;
	}

	textarea {
		height: 100px;
		resize: vertical;
	}

	.button-group {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
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
