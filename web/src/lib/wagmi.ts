import { defaultConfig } from 'svelte-wagmi';
import { base } from '@wagmi/core/chains';
import { coinbaseWallet, injected, walletConnect } from '@wagmi/connectors';
import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';

export const initWagmi = () => {
	const config = defaultConfig({
		appName: 'airdrop',
		chains: [base],
		connectors: [
			injected(),
			walletConnect({
				projectId: PUBLIC_WALLETCONNECT_ID,
				showQrModal: false
			}),
			coinbaseWallet({
				appName: 'airdrop',
				preference: 'all'
			})
		],
		autoConnect: true,
		walletConnectProjectId: PUBLIC_WALLETCONNECT_ID
	});

	return config.init();
};
