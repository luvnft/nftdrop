<script>
  import { page } from '$app/stores'
  const projectId = $page.url.searchParams.get('id')
  console.log(projectId)
</script>

<h1>You're getting a free NFT from {projectId}!</h1>
<p>Please identify yourself to mint your unique collectible!</p>
