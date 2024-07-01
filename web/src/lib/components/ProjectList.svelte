<script>
	import EditProjectModal from './EditProjectModal.svelte';
	import { PUBLIC_BASE_BLOCKSCOUT_URL, PUBLIC_ZORA_CO_URL } from '$env/static/public';
	import { getRelativeTime } from '$lib';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { networksAndContracts } from '$lib/contracts';

	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;

	/**
	 * @type {any[]}
	 */
	let projects = [];
	// let newProjectTitle = 'Midsummer';
	// let newProjectFrom = 'Nordic Traditions Collective';
	// let newProjectERC1155 = '0xa89473261cc82b9044b6a1442fdb840ad3146cdf';
	// let newProjectTokenId = '1';
	// let newProjectImage =
	// 	'https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fmagic.decentralized-content.com%2Fipfs%2Fbafybeie3yltt77fmf6v6vmzspkdv4hkh6sn6mj62k7nwjbqvpmpo5a26bq&w=1920&q=75';
	// let newProjectDescription = 'Capture the enchantment of Midsummer with this mystical NFT.';

	let newProjectTitle = '';
	let newProjectFrom = '';
	let newProjectERC1155 = '';
	let newProjectTokenId = '';
	let newProjectImage = '';
	let newProjectDescription = '';

	/**
	 * @type {import("../contracts").Network}
	 */
	let newSelectedNetwork = 'baseMainnet';

	/**
	 * @type {null}
	 */
	let editingProject = null;

	let isCreatingProject = false;
	let showCreateForm = false;
	let recordAirdropInProgress = false;
	let updatingAirdropStatusOnChain = false;
	let shouldUpdateOnChain = false;

	onMount(() => {
		if (currentUser) {
			fetchProjects();
		}
	});

	async function fetchProjects() {
		const token = await currentUser.getIdToken();
		const res = await api.fetchProjects(token);
		if (res.status === 200) {
			projects = await res.json();
		}
	}

	async function createProject() {
		isCreatingProject = true;
		const token = await currentUser.getIdToken();
		const res = await api.createProject(token, {
			title: newProjectTitle,
			from: newProjectFrom,
			nftContractAddress: newProjectERC1155,
			tokenId: newProjectTokenId,
			image: newProjectImage,
			description: newProjectDescription,
			network: newSelectedNetwork,
			trackerContractVersion:
				networksAndContracts[newSelectedNetwork].contracts.NFTAirdropTracker.latest.version,
			trackerContractAddress:
				networksAndContracts[newSelectedNetwork].contracts.NFTAirdropTracker.latest.address
		});
		if (res.status === 200) {
			const newProject = await res.json();
			projects = [...projects, newProject];
			resetForm();
		}
		isCreatingProject = false;
	}

	/**
	 * @param {any} project
	 */
	function openEditModal(project) {
		editingProject = project;
	}

	/**
	 * @param {{ detail: any; }} event
	 */
	function handleProjectUpdate(event) {
		const updatedProject = event.detail;
		projects = projects.map((p) => (p.id === updatedProject.id ? updatedProject : p));
		editingProject = null;
	}

	function resetForm() {
		newProjectTitle = '';
		newProjectFrom = '';
		newProjectERC1155 = '';
		newProjectTokenId = '';
		newProjectImage = '';
		newProjectDescription = '';
		newSelectedNetwork = 'baseMainnet';

		showCreateForm = false;
	}

	/**
	 * @param {string} projectId
	 * @param {boolean} claimOpen
	 */
	async function setProjectClaimOpen(projectId, claimOpen) {
		const message = claimOpen
			? 'Are you sure you want to allow claiming for this project? Everyone with the QR code or the link will be able to claim the NFT.'
			: 'Are you sure you want to disable claiming for this project?';
		if (confirm(message)) {
			const token = await currentUser.getIdToken();
			const res = await api.setProjectClaimOpen(token, projectId, claimOpen);
			if (res.status === 200) {
				projects = projects.map((project) => {
					if (project.id === projectId) {
						return { ...project, claimOpen };
					}
					return project;
				});
			}
		}
	}

	/**
	 * @param {string} projectId
	 */
	async function recordAirdropOnChain(projectId) {
		if (
			confirm(
				'This airdrop project must be added to the blockchain to allow claiming. All airdrop claims will be recorded as they come in. This incurs a small gas fee which will be covered by us. Continue?'
			)
		) {
			recordAirdropInProgress = true;
			const token = await currentUser.getIdToken();
			const res = await api.recordProjectOnChain(token, projectId);
			if (res.status === 200) {
				const { txHash } = await res.json();
				projects = projects.map((project) => {
					if (project.id === projectId) {
						return { ...project, existsOnChain: true, txHash };
					}
					return project;
				});
			}
			recordAirdropInProgress = false;
		}
	}

	/**
	 * @param {any} project
	 */
	async function copyWalletAddresses(project) {
		/**
		 * @type {string[]}
		 */
		let addresses = [];

		if (shouldUpdateOnChain) {
			const shouldContinue = confirm(
				'We are going to check for landed airdrops and update the airdrop statuses on chain, to only give you the addresses which have not yet received your airdrop. This will incur a small gas fee which will be covered by us. Please do this only after you have airdropped NFTs. Continue?'
			);
			if (!shouldContinue) {
				return;
			}
		}

		updatingAirdropStatusOnChain = true;

		const token = await currentUser.getIdToken();
		const res = await api.fetchProjectAirdropStatus(token, project.id, shouldUpdateOnChain);
		if (res.status === 200) {
			const {
				mintCount,
				waitingForAirdropCount,
				lastUpdatedOnChainAt,
				eligibleAddresses,
				eligibleAddressesLastUpdatedAt
			} = await res.json();
			addresses = eligibleAddresses;
			projects = projects.map((p) => {
				if (p.id === project.id) {
					return {
						...p,
						mintCount,
						waitingForAirdropCount,
						lastUpdatedOnChainAt,
						eligibleAddresses,
						eligibleAddressesLastUpdatedAt
					};
				}
				return p;
			});
		}

		updatingAirdropStatusOnChain = false;
	}

	/**
	 * @param {{ eligibleAddresses: string[]; }} project
	 */
	function copyEligibleAddresses(project) {
		if (project.eligibleAddresses && project.eligibleAddresses.length > 0) {
			const addresses = project.eligibleAddresses.join('\n');
			navigator.clipboard
				.writeText(addresses)
				.then(() =>
					alert(
						(project.eligibleAddresses.length > 1
							? `${project.eligibleAddresses.length} wallet addresses copied to clipboard!`
							: 'One wallet address copied to clipboard!') +
							'\n\nTo airdrop the NFTs: Go to your NFT page on Zora -> Select Manage settings -> Airdrop -> Paste the addresses in the text box -> Click Airdrop. Please double check that the contract address and token ID match with this project before airdropping. Otherwise we cannot track the airdrops on Base.\n\nAfter airdropping, come back here and click the refresh button to update the airdrop status on chain.'
					)
				)
				.catch((err) => console.error('Failed to copy addresses:', err));
		} else {
			alert('No addresses to copy');
		}
	}

	/**
	 * @param {string} projectId
	 */
	function toggleAddressList(projectId) {
		projects = projects.map((p) =>
			p.id === projectId ? { ...p, showAddresses: !p.showAddresses } : p
		);
	}

	$: if (currentUser) {
		fetchProjects();
	}
</script>

{#if editingProject}
	<EditProjectModal
		project={editingProject}
		{currentUser}
		on:close={() => (editingProject = null)}
		on:projectUpdated={handleProjectUpdate}
	/>
{/if}

<div class="project-list">
	<h2>My NFT Airdrop Projects</h2>

	<div class="create-project">
		<h3>Create New Project</h3>
		<p>
			Before creating a project, you have to post a NFT on Base or Zora network on <a
				href="https://zora.co/create"
				target="_blank"
				class="text-link">zora.co/create</a
			>. This will incur a small gas fee. After you have created a NFT on Zora.co, you can create
			and manage your airdrop here.
		</p>
		<p>
			We will provide you a QR code which links to a unique claim page for your airdrop. At this
			point, the airdrop must still be done on Zora.co, but it will be easy to do: just copy the
			addresses from our site and paste them into the airdrop form on Zora.co. You must have created
			the NFT on Zora.co (or use the same contract type) to be able to airdrop and track it here.
		</p>
		<p>
			The airdrop project and all claims to it will be recorded on-chain and the gas fees will be
			covered by us. Please consider donating some ETH to the developer wallet, on Base and/or Zora
			networks <code>0x941729C01ff11b4B25bAA4037f225BF2AE115a12</code>
		</p>
		{#if !showCreateForm}
			<button on:click={() => (showCreateForm = true)} class="btn btn-primary">
				I already created my NFT
			</button>
		{:else}
			<div transition:fade>
				<div class="select-wrapper">
					<select bind:value={newSelectedNetwork}>
						{#each Object.entries(networksAndContracts) as [network, info]}
							<option value={network}
								>{info.displayName} {network === 'baseMainnet' ? '(default)' : ''}</option
							>
						{/each}
					</select>
				</div>
				<input type="text" bind:value={newProjectTitle} placeholder="NFT Title" />
				<input
					type="text"
					bind:value={newProjectFrom}
					placeholder="Airdrop from (your signature)"
				/>
				<input
					type="text"
					bind:value={newProjectERC1155}
					placeholder="Collection of the NFT on Zora.co (ERC-1155 Address)"
				/>
				<input
					type="text"
					bind:value={newProjectTokenId}
					placeholder="Edition number of the NFT on Zora.co (ERC-1155 Token ID)"
				/>
				<input
					type="text"
					bind:value={newProjectImage}
					placeholder="Link to image (will be shown on this site)"
				/>
				<textarea bind:value={newProjectDescription} placeholder="NFT Description" />

				<div class="button-group">
					<button on:click={createProject} disabled={isCreatingProject} class="btn btn-primary">
						{isCreatingProject ? 'Creating...' : 'Create NFT Airdrop'}
					</button>
					<button on:click={resetForm} class="btn btn-secondary">Cancel</button>
				</div>
			</div>
		{/if}
	</div>

	{#if projects.length > 0}
		<ul>
			{#each projects as project (project.id)}
				<li>
					<img src={project.image} alt={project.title} class="project-image" />
					<div class="project-info">
						<h3>{project.title}</h3>
						<p>{project.description}</p>

						{#if project.existsOnChain}
							<p class="claim-status">
								{project.claimOpen
									? 'Claiming is now open for everyone with the link'
									: 'Claiming is closed'}
							</p>
						{/if}

						{#if project.mintCount > 0}
							<p class="claim-status">
								Total claims: {project.mintCount}
								{#if project.latestClaimAt}
									<br />
									<i title={project.latestClaimAt}
										>Latest claim {getRelativeTime(new Date(project.latestClaimAt))}</i
									>
								{/if}
							</p>

							{#if project.existsOnChain}
								{@const checkboxDisabled =
									updatingAirdropStatusOnChain ||
									!project.eligibleAddresses ||
									project.eligibleAddresses.length === 0}
								<div class="airdrop-actions">
									<label class="checkbox-label">
										<input
											type="checkbox"
											title="Check to update received airdrop claims on chain. This will incur a small gas fee which will be covered by us."
											on:click={() => (shouldUpdateOnChain = !shouldUpdateOnChain)}
											class="checkbox"
											disabled={checkboxDisabled}
											checked={shouldUpdateOnChain}
										/>
										<span
											style:opacity={checkboxDisabled ? 0.5 : 1}
											style:cursor={checkboxDisabled ? 'not-allowed' : 'pointer'}
										>
											Check to remove already airdropped addresses from the list of eligible
											addresses during Update
											{#if project.lastUpdatedOnChainAt}
												<br />
												<i title={project.lastUpdatedOnChainAt}
													>Received airdrops last updated {getRelativeTime(
														new Date(project.lastUpdatedOnChainAt)
													)}</i
												>
											{/if}
										</span>
									</label>
									<button
										on:click={() => copyWalletAddresses(project)}
										class="btn btn-secondary"
										disabled={updatingAirdropStatusOnChain}
									>
										Update Eligible Addresses
									</button>
								</div>
								<div class="eligible-addresses-container">
									<div class="eligible-addresses-header">
										<h4>
											Eligible Addresses ({project.eligibleAddresses?.length ?? 0})
											{#if project.eligibleAddressesLastUpdatedAt}
												<br />
												<i title={project.eligibleAddressesLastUpdatedAt}
													>Last updated {getRelativeTime(
														new Date(project.eligibleAddressesLastUpdatedAt)
													)}</i
												>
											{/if}
										</h4>
										<div class="eligible-addresses-actions">
											<button
												on:click={() => copyEligibleAddresses(project)}
												class="btn btn-icon"
												title="Copy addresses"
												disabled={!project.eligibleAddresses ||
													project.eligibleAddresses.length === 0}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
												</svg>
											</button>
											<button
												on:click={() => toggleAddressList(project.id)}
												class="btn btn-icon"
												title="Toggle address list"
												disabled={!project.eligibleAddresses ||
													project.eligibleAddresses.length === 0}
											>
												{#if project.showAddresses}
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<polyline points="18 15 12 9 6 15"></polyline>
													</svg>
												{:else}
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<polyline points="6 9 12 15 18 9"></polyline>
													</svg>
												{/if}
											</button>
										</div>
									</div>
									{#if project.showAddresses}
										<div class="eligible-addresses-list">
											{#each project.eligibleAddresses || [] as address}
												<div class="address">{address}</div>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						{/if}
						<p class="claim-status">
							{project.existsOnChain
								? 'This airdrop project has been recorded on Base'
								: 'This airdrop project has not been recorded on Base yet. You have to record the project on Base before allowing claim is possible.'}
							{#if project.txHash}
								<br />
								<a
									class="text-link"
									href={`${PUBLIC_BASE_BLOCKSCOUT_URL}/tx/${project.txHash}`}
									target="_blank"
									rel="noopener noreferrer"><i>View on Blockscout</i></a
								>
							{/if}
						</p>
						<div class="project-actions">
							<a href="/claim/?id={project.id}" class="btn btn-primary">View Claim Page</a>
							<a href="/qr/?id={project.id}" class="btn btn-secondary">View QR Code Page</a>
							<a
								href="{PUBLIC_ZORA_CO_URL}/manage/1155/base:{project.nftContractAddress}/{project.tokenId}/airdrop"
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-secondary">Airdrop on Zora.co</a
							>
							<button
								on:click={() => setProjectClaimOpen(project.id, !project.claimOpen)}
								class="btn btn-tertiary"
								disabled={!project.existsOnChain}
							>
								{project.claimOpen ? 'Disable claim' : 'Allow claim'}
							</button>
							{#if !project.existsOnChain}
								{#if !project.existsOnChain}
									<button on:click={() => openEditModal(project)} class="btn btn-secondary">
										Edit Project
									</button>
								{/if}
								<button
									disabled={recordAirdropInProgress}
									on:click={() => recordAirdropOnChain(project.id)}
									class="btn btn-tertiary"
								>
									Record Airdrop on Base
								</button>
							{/if}
						</div>
					</div>
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
		padding: 1rem 3rem 1rem 2rem;
		border-radius: 15px;
		margin-bottom: 2rem;
	}

	.project-image {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.75rem;
		margin-bottom: 1rem;
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

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 25px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
		text-decoration: none;
		display: inline-block;
		text-align: center;
	}

	.btn-primary {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		color: white;
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.2);
		color: var(--text-color);
	}

	.btn-tertiary {
		background: rgba(255, 0, 0, 0.2);
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

	.button-group {
		display: flex;
		gap: 1rem;
		justify-content: flex-start;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(6px);
		border-radius: 15px;
		margin-bottom: 1.5rem;
		overflow: hidden;
	}

	.project-info {
		margin-bottom: 1.5rem;
		padding: 2rem;
	}

	.claim-status {
		font-weight: bold;
		color: var(--accent-color);
	}

	.project-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}

	@media (max-width: 600px) {
		.project-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.btn {
			width: 90%;
		}
	}

	.airdrop-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		cursor: pointer;
		font-size: 1rem;
		color: var(--text-color);
	}

	.checkbox {
		appearance: none;
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		border: 2px solid var(--accent-color);
		border-radius: 4px;
		margin-right: 0.5rem;
		margin-bottom: 0;
		display: grid;
		place-content: center;
		cursor: pointer;
	}

	.checkbox::before {
		content: '';
		width: 12px;
		height: 12px;
		transform: scale(0);
		transition: 120ms transform ease-in-out;
		box-shadow: inset 1em 1em var(--accent-color);
		transform-origin: center;
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
	}

	.checkbox:checked::before {
		transform: scale(1);
	}

	.checkbox:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Responsive styles */
	@media (max-width: 600px) {
		.airdrop-actions {
			flex-direction: column;
			align-items: flex-start;
		}

		.checkbox-label {
			margin-top: 0.5rem;
		}
	}

	.eligible-addresses-container {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		margin-top: 1rem;
		padding: 1rem;
	}

	.eligible-addresses-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.eligible-addresses-header h4 {
		margin: 0;
		color: var(--accent-color);
	}

	.eligible-addresses-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-icon {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		color: var(--text-color);
		transition: color 0.3s ease;
	}

	.btn-icon:hover:not(:disabled) {
		color: var(--accent-color);
	}

	.eligible-addresses-list {
		max-height: 200px;
		overflow-y: auto;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 4px;
		padding: 0.5rem;
	}

	.address {
		font-family: monospace;
		padding: 0.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.address:last-child {
		border-bottom: none;
	}

	.select-wrapper {
		position: relative;
		margin-bottom: 1rem;
	}

	.select-wrapper::after {
		content: '\25BC';
		position: absolute;
		top: 50%;
		right: 15px;
		transform: translateY(-50%);
		pointer-events: none;
		color: var(--accent-color);
	}

	select {
		width: 100%;
		padding: 0.75rem;
		padding-right: 30px;
		border-radius: 8px;
		border: 1px solid var(--accent-color);
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-color);
		font-size: 1rem;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		cursor: pointer;
	}

	select::-ms-expand {
		display: none;
	}

	select:focus {
		outline: none;
		box-shadow: 0 0 0 2px var(--accent-color);
	}
</style>
