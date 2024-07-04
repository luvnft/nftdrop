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

// in miliseconds
const units = {
	year: 24 * 60 * 60 * 1000 * 365,
	month: (24 * 60 * 60 * 1000 * 365) / 12,
	day: 24 * 60 * 60 * 1000,
	hour: 60 * 60 * 1000,
	minute: 60 * 1000,
	second: 1000
};

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function getRelativeTime(d1: Date, d2 = new Date()) {
	const elapsed = d1.getTime() - d2.getTime();

	// "Math.abs" accounts for both "past" & "future" scenarios
	for (const [unit, value] of Object.entries(units))
		if (Math.abs(elapsed) > value || unit == 'second')
			return rtf.format(Math.round(elapsed / value), unit as Intl.RelativeTimeFormatUnit);
}

export function measureSize(node: Element) {
	let observer: ResizeObserver;
	let size = { width: 0, height: 0 };

	function updateSize() {
		const newSize = node.getBoundingClientRect();
		if (newSize.width !== size.width || newSize.height !== size.height) {
			size = { width: newSize.width, height: newSize.height };
			node.dispatchEvent(new CustomEvent('size', { detail: size }));
		}
	}

	updateSize(); // Initial measurement

	if (typeof ResizeObserver !== 'undefined') {
		observer = new ResizeObserver(updateSize);
		observer.observe(node);
	} else {
		window.addEventListener('resize', updateSize);
	}

	return {
		destroy() {
			if (observer) {
				observer.disconnect();
			} else {
				window.removeEventListener('resize', updateSize);
			}
		}
	};
}
