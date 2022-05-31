<script>
import { goto } from '$app/navigation'
import { onMount, tick } from 'svelte'

import { width, height } from '../@store/filter'

export let w
export let h
export let glyphs

if (w) {
  width.set(w)

  if (h)
    height.set(h)
}

onMount(() => {
  width.subscribe(async (w) => {
    if (w === 'any')
      height.set('any')

    await tick()
    
    if ($height === 'any')
      height.set(w)

    updateSearchParams()
  })

  height.subscribe(updateSearchParams)
})

function updateSearchParams() {
  const searchParams = new URLSearchParams(location.search)
  
  if ($width === 'any') 
    searchParams.delete('w')
  else
    searchParams.set('w', $width)

  if ($height === 'any')
    searchParams.delete('h')
  else
    searchParams.set('h', $height)

  if (
    !searchParams.has('w')
    && !searchParams.has('h')
  ) goto(location.pathname)

  else
    goto(`${location.pathname}?${searchParams.toString()}`)
}

function reset() {
  width.set('any')
  goto(location)
}
</script>

<div class="flex mb-2 child:mr-2 child:flex child:items-center">
  <label class="child">
    <span class="mr-2">Width</span>
    <select class="w-24 h-8 border-2 border-gray active:border-blue-500 rounded px-2" bind:value={$width}>
      <option value="any">Any</option>
      <option value="8">8</option>
      <option value="16">16</option>
      <option value="32">32</option>
      <option value="64">64</option>
    </select>
  </label>

  <label class="child">
    <span class="mr-2">Height</span>
    <select class="w-24 h-8 border-2 border-gray active:border-blue-500 rounded px-2" bind:value={$height} disabled={$width === 'any'}>
      <option value="any">Any</option>
      <option value="8">8</option>
      <option value="16">16</option>
      <option value="32">32</option>
      <option value="64">64</option>
    </select>
  </label>

  {#if $width !== 'any' || $height !== 'any'}
    <button class="bg-black text-white py-1 px-2 rounded child" on:click={reset}>Reset</button>
  {/if}
</div>

<div class="flex flex-wrap">
  {#each glyphs as id (id) }
    <a href="/glyphs/{id}">
      <div class="w-24 border border-gray mr-2 mb-2">
        <img class="rendering-pixelated w-full" src="/glyphs/{id}.png">
      </div>
    </a>
  {/each}
</div>