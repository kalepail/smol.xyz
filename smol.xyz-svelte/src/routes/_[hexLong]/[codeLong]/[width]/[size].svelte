<script>
export let path
export let size
</script>

<svelte:head>
  <meta name="twitter:image" content="{path}/{size}.png">
  <meta property="og:url" content="{path}/{size}">
  <meta property="og:image" content="{path}/{size}.png">
  <link rel="icon" href="{path}.png">
</svelte:head>

<img class="mb-2" src="{path}/{size}.png" />