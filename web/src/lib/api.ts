import { PUBLIC_API_BASE_URL } from '$env/static/public';

export function setUserWallet(token: string, walletAddress: string) {
	return fetch(`${PUBLIC_API_BASE_URL}/user/wallet`, {
		method: 'POST',
		headers: {
			Authorization: `${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ primaryEthereumWallet: walletAddress })
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
	return fetch(`${PUBLIC_API_BASE_URL}/projects`, {
		method: 'GET',
		headers: {
			Authorization: `${token}`
		}
	});
}

export function deleteProject(token: string, projectId: string) {
	return fetch(`${PUBLIC_API_BASE_URL}/projects/${projectId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `${token}`
		}
	});
}

export function createProject(
	token: string,
	project: {
		title: string;
		from: string;
		description: string;
		image: string;
		nftLink: string;
	}
) {
	return fetch(`${PUBLIC_API_BASE_URL}/projects`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`
		},
		body: JSON.stringify(project)
	});
}
