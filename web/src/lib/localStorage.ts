import type { User } from '@firebase/auth';
import { fetchUserData } from './api';

export const LOCAL_STORAGE_ACTIVE_SECTION_KEY = 'activeSection';
export const LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY = 'userAirdropAddress';

export async function getUserAirdropAddress(currentUser: User | null): Promise<string | null> {
	if (!currentUser) {
		return null;
	}
	const cached = localStorage.getItem(`${LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY}`);
	if (cached !== undefined) {
		return cached;
	}
	const fromApi = await fetchUserData(await currentUser.getIdToken());
	if (fromApi.status === 200) {
		const { airdropWalletAddress } = await fromApi.json();
		localStorage.setItem(`${LOCAL_STORAGE_USER_AIRDROP_ADDRESS_KEY}`, airdropWalletAddress);
		return airdropWalletAddress;
	}
	return null;
}
