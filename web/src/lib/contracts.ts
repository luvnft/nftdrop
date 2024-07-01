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
				latest: { version: 3, address: '0x...' },
				deprecated: []
			}
		}
	},
	zoraSepolia: {
		displayName: 'Zora Sepolia',
		contracts: {
			NFTAirdropTracker: {
				latest: { version: 1, address: '0x...' },
				deprecated: []
			}
		}
	},
	baseMainnet: {
		displayName: 'Base Mainnet',
		contracts: {
			NFTAirdropTracker: {
				latest: { version: 1, address: '0x...' },
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
