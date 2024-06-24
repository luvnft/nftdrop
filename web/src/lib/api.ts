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
