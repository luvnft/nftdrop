// place files you want to import through the `$lib` alias in this folder.
export function getLocale() {
	return navigator.languages && navigator.languages.length
		? navigator.languages[0]
		: navigator.language;
}

export function formatTimestamp(timestamp: string) {
	return new Date(timestamp).toLocaleString(getLocale());
}
