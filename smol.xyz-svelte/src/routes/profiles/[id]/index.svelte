<script>
import { page } from '$app/stores'
import { onMount } from 'svelte'

import { handleResponse } from '../../../@js/utils';
import { token, tokenPayload } from '../../../@store/user'

export let glyphs

let collection = []

onMount(async () => {
  if ($tokenPayload?.sub === $page.params.id)
    collection = await fetch(`${location.pathname}/collection`, {
      headers: {
        Authorization: `Bearer ${$token}`
      } 
    })
    .then(handleResponse)
})
</script>

{#if glyphs.length}
<h1>Created</h1>
<div class="flex flex-wrap">
  {#each glyphs as id (id) }
    <a href="/glyphs/{id}">
      <div class="w-24 border border-gray mr-2 mb-2">
        <img class="rendering-pixelated w-full" src="/glyphs/{id}.png">
      </div>
    </a>
  {/each}
</div>
{/if}

{#if collection.length}
<h1>Collected</h1>
<div class="flex flex-wrap">
  {#each collection as id (id) }
    <a href="/glyphs/{id}">
      <div class="w-24 border border-gray mr-2 mb-2">
        <img class="rendering-pixelated w-full" src="/glyphs/{id}.png">
      </div>
    </a>
  {/each}
</div>
{/if}