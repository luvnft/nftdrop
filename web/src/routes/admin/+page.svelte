<script>
	import { createQrSvgString, createQrSvgDataUrl } from '@svelte-put/qr';

	const config = { data: 'http://192.168.10.94:5173/projects?id=moi' };

	const dataURL = createQrSvgDataUrl(config);
	const svgString = createQrSvgString(config);

	import { page } from '$app/stores';
	import { beforeUpdate } from 'svelte';

	let showLink = false;

	beforeUpdate(() => {
		showLink = $page.url.searchParams.get('showLink') === 'true';
	});
</script>

<div
	style:display="flex"
	style:flex-direction="column"
	style:align-items="center"
	style:justify-items="center"
	style:max-height="100vh"
>
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
</div>
