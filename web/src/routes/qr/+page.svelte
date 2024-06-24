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
</div>
