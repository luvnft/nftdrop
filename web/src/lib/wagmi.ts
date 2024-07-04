import { defaultConfig } from 'svelte-wagmi';
import { base } from '@wagmi/core/chains';
import { coinbaseWallet } from '@wagmi/connectors';
import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';

export const initWagmi = () => {
	const config = defaultConfig({
		appName: 'Mint Wave',
		chains: [base],
		connectors: [
			coinbaseWallet({
				appName: 'Mint Wave',
				preference: 'smartWalletOnly'
			})
		],
		autoConnect: true,
		// If you need to use Alchemy or WalletConnect, add their IDs here
		// alchemyId: import.meta.env.VITE_ALCHEMY_ID,
		walletConnectProjectId: PUBLIC_WALLETCONNECT_ID
	});

	return config.init();
};
