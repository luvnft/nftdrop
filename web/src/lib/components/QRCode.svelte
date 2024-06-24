<script>
	import { createQrSvgString, createQrSvgDataUrl } from '@svelte-put/qr';
	import { page } from '$app/stores';
	import { beforeUpdate } from 'svelte';

	export let projectId;
	export let showLink = false;

	let dataURL = '';
	let svgString = '';

	beforeUpdate(() => {
		console.log($page.url.host);
		const config = { data: `${$page.url.protocol}//${$page.url.host}/projects/?id=${projectId}` };
		console.log(config.data);
		dataURL = createQrSvgDataUrl(config);
		svgString = createQrSvgString(config);
	});
</script>

<a
	style:width="70vw"
	style:max-width="75vh"
	style:margin-top="10vh"
	style:color="inherit"
	download="nft-qr.svg"
	href={dataURL}
>
	{@html svgString}
</a>

<a
	href={dataURL}
	style={!showLink ? 'visibility:hidden;' : ''}
	download="nft-qr.svg"
	style:margin="1em">Click to download QR as SVG</a
>
