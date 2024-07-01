export type Network = 'baseSepolia' | 'baseMainnet' | 'zoraSepolia' | 'zoraMainnet';

type ContractName = 'NFTAirdropTracker';

type ContractInfo = {
	version: number;
	address: string;
};

type ContractVersions = {
	latest: ContractInfo;
	deprecated: ContractInfo[];
};

type NetworkInfo = {
	displayName: string;
	contracts: Record<ContractName, ContractVersions>;
};

type NetworksAndContracts = Record<Network, NetworkInfo>;

export const networksAndContracts: NetworksAndContracts = {
	baseSepolia: {
		displayName: 'Base Sepolia',
		contracts: {
			NFTAirdropTracker: {
				latest: { version: 1, address: '0x15EAd7Ad74027AA45A0152048F0532b391314297' },
				deprecated: []
			}
		}
	},
	zoraSepolia: {
		displayName: 'Zora Sepolia',
		contracts: {
			NFTAirdropTracker: {
				latest: { version: 1, address: '0xc2DE3D2eB84c229d2087D01615d816f1CF5a83D9' },
				deprecated: []
			}
		}
	},
	baseMainnet: {
		displayName: 'Base Mainnet',
		contracts: {
			NFTAirdropTracker: {
				latest: {
					version: 1,
					address: '0x2E3cCAab4Cbe34A0018e79Fc26233AAAf81BCf56' // Deployment cost 0.00002272 ETH https://base.blockscout.com/address/0x941729C01ff11b4B25bAA4037f225BF2AE115a12
				},
				deprecated: []
			}
		}
	},
	zoraMainnet: {
		displayName: 'Zora Mainnet',
		contracts: {
			NFTAirdropTracker: {
				latest: { version: 1, address: '0x...' },
				deprecated: []
			}
		}
	}
};
