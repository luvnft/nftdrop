<script>
	import { createQrSvgString, createQrSvgDataUrl } from '@svelte-put/qr';

	const config = { data: 'http://192.168.10.94:5173/projects?id=moi' };

	const dataURL = createQrSvgDataUrl(config);
	const svgString = createQrSvgString(config);
</script>

<div
	style:display="flex"
	style:flex-direction="column"
	style:align-items="center"
	style:justify-items="center"
	style:height="100vh"
>
	<div style:width="50vw" style:max-width="75vh" style:max-height="70vh">
		{@html svgString}
	</div>

	<a style="margin: 40px" class="c-btn" href={dataURL} download="qr.svg">Download QR as SVG</a>
</div>
