// place files you want to import through the `$lib` alias in this folder.
export function getLocale() {
	return navigator.languages && navigator.languages.length
		? navigator.languages[0]
		: navigator.language;
}

export function formatTimestamp(timestamp: string) {
	return new Date(timestamp).toLocaleString(getLocale());
}

export function getZoraCollectUrl(nftContractAddress: string, tokenId: string) {
	return `https://zora.co/collect/base:${nftContractAddress}/${tokenId}?referrer=0x9477f1031d1b2Ec181E8c3121e523877c7460C92`;
}
