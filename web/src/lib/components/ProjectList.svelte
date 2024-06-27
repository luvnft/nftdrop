<script>
	import { PUBLIC_BASE_BLOCKSCOUT_URL, PUBLIC_ZORA_CO_URL } from '$env/static/public';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	/**
	 * @type {import("@firebase/auth").User}
	 */
	export let currentUser;

	/**
	 * @type {any[]}
	 */
	let projects = [];
	let newProjectTitle = 'Midsummer';
	let newProjectFrom = 'Nordic Traditions Collective';
	let newProjectERC1155 = '0xa89473261cc82b9044b6a1442fdb840ad3146cdf';
	let newProjectTokenId = '1';
	let newProjectImage =
		'https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fmagic.decentralized-content.com%2Fipfs%2Fbafybeie3yltt77fmf6v6vmzspkdv4hkh6sn6mj62k7nwjbqvpmpo5a26bq&w=1920&q=75';
	let newProjectDescription = 'Capture the enchantment of Midsummer with this mystical NFT.';

	// let newProjectTitle = '';
	// let newProjectFrom = '';
	// let newProjectNftLink = '';
	// let newProjectImage = '';
	// let newProjectDescription = '';
	let isCreatingProject = false;
	let showCreateForm = false;
	let recordAirdropInProgress = false;
	let updatingAirdropStatusOnChain = false;

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
			description: newProjectDescription
		});
		if (res.status === 200) {
			const newProject = await res.json();
			projects = [...projects, newProject];
			resetForm();
		}
		isCreatingProject = false;
	}

	function resetForm() {
		newProjectTitle = '';
		newProjectFrom = '';
		newProjectERC1155 = '';
		newProjectTokenId = '';
		newProjectImage = '';
		newProjectDescription = '';
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

	/* async function copyWalletAddresses(projectId) {
		const token = await currentUser.getIdToken();
		const res = await api.getProjectWalletAddresses(token, projectId);
		if (res.status === 200) {
			const addresses = await res.json();
			navigator.clipboard.writeText(addresses.join('\n'));
			alert('Wallet addresses copied to clipboard!');
		}
	} */
	/**
	 * @param {any} project
	 */
	async function copyWalletAddresses(project) {
		/* const addresses = [
			'0x9477f1031d1b2Ec181E8c3121e523877c7460C92',
			'0x9477f1031d1b2Ec181E8c3121e523877c7460C92',
			'0x9477f1031d1b2Ec181E8c3121e523877c7460C92'
		];
		 */

		let shouldUpdateOnChain =
			project.lastUpdatedOnChainAt && project.lastUpdatedOnChainAt < project.latestClaimAt;

		/**
		 * @type {string[]}
		 */
		let addresses = [];

		if (shouldUpdateOnChain) {
			const willUpdate = confirm(
				'New claims have been made since last update on chain. Update now? This will incur a small gas fee which will be covered by us. If you skip this, the copied addresses might contain addresses which already received the airdrop.'
			);
			const token = await currentUser.getIdToken();
			if (willUpdate) updatingAirdropStatusOnChain = true;
			const res = await api.fetchProjectAirdropStatus(token, project.id, willUpdate);
			if (res.status === 200) {
				const { mintCount, waitingForAirdropCount, lastUpdatedOnChainAt, eligibleAddresses } =
					await res.json();
				addresses = eligibleAddresses;
				projects = projects.map((project) => {
					if (project.id === project.id) {
						return { ...project, mintCount, waitingForAirdropCount, lastUpdatedOnChainAt };
					}
					return project;
				});
			}
			if (willUpdate) updatingAirdropStatusOnChain = false;
		} else {
			const token = await currentUser.getIdToken();
			const res = await api.fetchProjectAirdropStatus(token, project.id, false);
			if (res.status === 200) {
				const { mintCount, waitingForAirdropCount, lastUpdatedOnChainAt, eligibleAddresses } =
					await res.json();
				addresses = eligibleAddresses;
				projects = projects.map((project) => {
					if (project.id === project.id) {
						return { ...project, mintCount, waitingForAirdropCount, lastUpdatedOnChainAt };
					}
					return project;
				});
			}
		}

		if (addresses.length === 0) {
			alert('No addresses to copy!');
			return;
		}

		console.log('got addresses', addresses.length, addresses, addresses.join('\n'));

		navigator.clipboard.writeText(addresses.join('\n'));

		alert(
			addresses.length > 1
				? `${addresses.length} wallet addresses copied to clipboard`
				: 'Wallet address copied to clipboard' +
						'\n\nTo airdrop the NFTs: Go to your NFT page on Zora -> Select Manage settings -> Airdrop -> Paste the addresses in the text box -> Click Airdrop. Please double check that the contract address and token ID match with this project before airdropping. Otherwise we cannot track the airdrops on Base.\n\nAfter airdropping, come back here and click the refresh button to update the airdrop status on chain.'
		);
	}

	/**
	 * @param {string} projectId
	 */
	async function updateAirdropStatusOnChain(projectId) {
		const willUpdate = confirm(
			'Check for landed airdrops and update the airdrop status on chain. This will incur a small gas fee which will be covered by us. Please do not do this unless you have airdropped NFTs on Zora already. Continue?'
		);
		if (!willUpdate) {
			return;
		}
		updatingAirdropStatusOnChain = true;
		const token = await currentUser.getIdToken();
		const res = await api.fetchProjectAirdropStatus(token, projectId, true);
		if (res.status === 200) {
			const { mintCount, waitingForAirdropCount, lastUpdatedOnChainAt } = await res.json();
			projects = projects.map((project) => {
				if (project.id === projectId) {
					return { ...project, mintCount, waitingForAirdropCount, lastUpdatedOnChainAt };
				}
				return project;
			});
		}
		updatingAirdropStatusOnChain = false;
	}

	$: if (currentUser) {
		fetchProjects();
	}
</script>

<div class="project-list">
	<h2>My NFT Airdrop Projects</h2>

	<div class="create-project">
		<h3>Create New Project</h3>
		<p>
			Before creating a project, you have to post a NFT on <a
				href="https://zora.co/create"
				target="_blank"
				class="text-link">zora.co/create</a
			>. This will incur a small gas fee. After you have created a NFT on Zora, you can create and
			manage your airdrop here.
		</p>
		<p>
			We will provide you a QR code which links to a unique claim page for your airdrop. At this
			point, the airdrop must still be done on Zora, but it will be easy to do: just copy the
			addresses from our site and paste them into the airdrop form on Zora. You must have created
			the NFT on Zora to be able to airdrop.
		</p>
		<p>
			The airdrop project and all claims to it will be recorded on Base and the gas fees will be
			covered by us. Please consider donating some ETH to the developer wallet <code
				>0x941729C01ff11b4B25bAA4037f225BF2AE115a12</code
			>
		</p>
		{#if !showCreateForm}
			<button on:click={() => (showCreateForm = true)} class="btn btn-primary">
				I already created my NFT
			</button>
		{:else}
			<div transition:fade>
				<input type="text" bind:value={newProjectTitle} placeholder="NFT Title" />
				<input
					type="text"
					bind:value={newProjectFrom}
					placeholder="Airdrop from (your signature)"
				/>
				<input
					type="text"
					bind:value={newProjectERC1155}
					placeholder="Collection of the NFT on Zora (ERC-1155 Address)"
				/>
				<input
					type="text"
					bind:value={newProjectTokenId}
					placeholder="Edition number of the NFT on Zora (ERC-1155 Token ID)"
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
							<p class="claim-status">Total claims: {project.mintCount}</p>
							<p class="claim-status">
								Claims waiting for airdrop: {project.waitingForAirdropCount ?? project.mintCount}
								{project.lastUpdatedOnChainAt
									? `(Last
									checked on ${project.lastUpdatedOnChainAt}`
									: ''}

								{#if project.existsOnChain}
									<button
										title="Check for landed claims and update the airdrop status on chain. This will incur a small gas fee which will be covered by us."
										on:click={() => updateAirdropStatusOnChain(project.id)}
										class="btn btn-refresh"
										disabled={updatingAirdropStatusOnChain ||
											(project.lastUpdatedOnChainAt &&
												project.lastUpdatedOnChainAt < project.latestClaimAt)}>⟳</button
									>
								{/if}
							</p>

							{#if project.existsOnChain}
								<button on:click={() => copyWalletAddresses(project)} class="btn btn-secondary">
									Copy Wallet Addresses Waiting for Airdrop
								</button>
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
							<a href="/qr/?id={project.id}" class="btn btn-secondary">Get QR Code</a>
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

	.btn-refresh {
		border-radius: 15%;
		font-size: 1.25rem;
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
			width: 100%;
		}
	}
</style>
