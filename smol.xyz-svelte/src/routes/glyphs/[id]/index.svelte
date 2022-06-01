<script>
import { onMount } from "svelte";

import { handleResponse } from "../../../@js/utils"
import { token, tokenPayload } from '../../../@store/user'

export let path
export let palette
export let metadata

let collected

onMount(async () => {
  if (metadata.author !== $tokenPayload?.sub)
    collected = await fetch(`${location.pathname}/collected`, {
      headers: {
        Authorization: `Bearer ${$token}`
      } 
    })
    .then(handleResponse)
})

function collect() {
  fetch(`${location.pathname}/collect`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${$token}`
    }
  })
  .then(handleResponse)
  .then(() => collected = true)
}
</script>

<svelte:head>
  <meta name="twitter:image" content="{path}/lrg.png">
  <meta property="og:url" content="{path}">
  <meta property="og:image" content="{path}/lrg.png">
  <link rel="icon" href="{path}.png">
</svelte:head>

<div class="flex mb-2">
  <img class="w-48 border border-gray rendering-pixelated w-full" src="{path}.png">

  <div class="ml-2">
    <h1>{metadata.name}</h1>
    <p>{metadata.description}</p>
    <p>{metadata.width}x{metadata.height}</p>
    <a class="text-blue-500 hover:underline" href={`/profiles/${metadata.author}`}>@{metadata.username || metadata.author}</a>
  </div>
</div>

<ul class="flex">
  {#each palette as {hex, count} (hex)}
  <li class="flex flex-col items-center">
    <div class="w-6 h-6" style:background-color="#{hex}" style:box-shadow={`inset 0 0 0 1px ${/ffffff/gi.test(hex) ? '#e5e7eb' : `#${hex}`}`}></div>
    <span class="text-sm">{count}</span>
  </li>
  {/each}
</ul>

{#if metadata.author !== $tokenPayload?.sub}
<div class="mt-2 flex">
  {#if collected}
    <p class="text-green-500">Collected</p>
  {:else}
    <button on:click={collect} class="mr-2 bg-black text-white py-1 px-2 rounded">Collect</button>
  {/if}
</div>
{/if}