import { PUBLIC_API_BASE_URL } from '$env/static/public';

export function setUserWallet(token: string, walletAddress: string) {
	return fetch(`${PUBLIC_API_BASE_URL}/user/wallet`, {
		method: 'POST',
		headers: {
			Authorization: `${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ airdropWalletAddress: walletAddress })
	});
}

export function fetchUserData(token: string) {
	return fetch(`${PUBLIC_API_BASE_URL}/user`, {
		method: 'GET',
		headers: {
			Authorization: `${token}`
		}
	});
}

export function fetchMints(token: string) {
	return fetch(`${PUBLIC_API_BASE_URL}/mint`, {
		method: 'GET',
		headers: {
			Authorization: `${token}`
		}
	});
}

export function createMint(token: string, projectId: string) {
	return fetch(`${PUBLIC_API_BASE_URL}/mint`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`
		},
		body: JSON.stringify({ projectId })
	});
}

export function fetchProjects(token: string) {
	return fetch(`${PUBLIC_API_BASE_URL}/project`, {
		method: 'GET',
		headers: {
			Authorization: `${token}`
		}
	});
}

export function fetchProjectAirdropStatus(
	token: string,
	projectId: string,
	updateOnChain: boolean
) {
	return fetch(
		`${PUBLIC_API_BASE_URL}/project/${projectId}/airdropStatus${updateOnChain ? '?updateOnChain=true' : ''}`,
		{
			method: 'GET',
			headers: {
				Authorization: `${token}`
			}
		}
	);
}

export function recordProjectOnChain(token: string, projectId: string) {
	return fetch(`${PUBLIC_API_BASE_URL}/project/${projectId}/recordOnChain`, {
		method: 'POST',
		headers: {
			Authorization: `${token}`
		}
	});
}

export function setProjectClaimOpen(token: string, projectId: string, claimOpen: boolean) {
	return fetch(`${PUBLIC_API_BASE_URL}/project/${projectId}/claimOpen`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`
		},
		body: JSON.stringify({ claimOpen })
	});
}

export function createProject(
	token: string,
	project: {
		title: string;
		from: string;
		description: string;
		image: string;
		nftContractAddress: string;
		tokenId: string;
		network: string;
		trackerContractAddress: string;
		trackerContractVersion: number;
	}
) {
	return fetch(`${PUBLIC_API_BASE_URL}/project`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`
		},
		body: JSON.stringify(project)
	});
}

export function updateProject(
	token: string,
	projectId: string,
	project: {
		title: string;
		from: string;
		description: string;
		image: string;
		nftContractAddress: string;
		tokenId: string;
	}
) {
	return fetch(`${PUBLIC_API_BASE_URL}/project/${projectId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`
		},
		body: JSON.stringify(project)
	});
}
