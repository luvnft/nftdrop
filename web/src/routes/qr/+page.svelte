<script>
	import { page } from '$app/stores';
	import { beforeUpdate } from 'svelte';
	import QrCode from '$lib/components/QRCode.svelte';

	let showLink = false;
	/**
	 * @type {string | null}
	 */
	let projectId;

	beforeUpdate(() => {
		/* console.log($page.url.host);
		const config = { data: `${$page.url.protocol}//${$page.url.host}/projects/?id=moi` };
		console.log(config.data);
		dataURL = createQrSvgDataUrl(config);
		svgString = createQrSvgString(config); */
		showLink = $page.url.searchParams.get('showLink') === 'true';
		projectId = $page.url.searchParams.get('id');
	});
</script>

<div
	style:display="flex"
	style:flex-direction="column"
	style:align-items="center"
	style:justify-items="center"
	style:max-height="100vh"
>
	{#if projectId}
		<QrCode {projectId} {showLink} />
	{/if}

	<!-- <a
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
	> -->
</div>
