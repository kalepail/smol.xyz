<script>
import { countBy } from 'lodash-es'
import { onMount } from 'svelte'
import { writable, derived } from 'svelte/store'

import { token } from '../../@store/user'
import { handleResponse } from '../../@js/utils'

import HexGlyph from '../../@components/HexGlyph.svelte'

const width = writable(8)
const name = writable('')
const description = writable('')
const palette = writable([])

const colors = derived(palette, (p) => {
  return Object.entries(countBy(p)).map(([hex, count]) => ({hex, count}))
})

let color = '#000000'

$: {
  if ($width > 64) width.set(64)
  else if (!$width || $width < 1) width.set(1)
}

onMount(() => {
  if (localStorage.hasOwnProperty('smol.xyz_createWidth'))
    width.set(localStorage.getItem('smol.xyz_createWidth'))

  if (localStorage.hasOwnProperty('smol.xyz_createName'))
    name.set(localStorage.getItem('smol.xyz_createName'))

  if (localStorage.hasOwnProperty('smol.xyz_createDescription'))
    description.set(localStorage.getItem('smol.xyz_createDescription'))

  if (localStorage.hasOwnProperty('smol.xyz_createPalette'))
    palette.set(JSON.parse(localStorage.getItem('smol.xyz_createPalette')))

  width.subscribe((w) => {
    localStorage.setItem('smol.xyz_createWidth', w)

    palette.update((p) =>
      new Array(Math.pow(w, 2)).fill('#ffffff').map((white, i) => p[i] || white)
    )
  })

  name.subscribe((n) => localStorage.setItem('smol.xyz_createName', n))
  description.subscribe((d) => localStorage.setItem('smol.xyz_createDescription', d))
  palette.subscribe((p) => localStorage.setItem('smol.xyz_createPalette', JSON.stringify(p)))
})

function colorPixel(e, i) {
  if (
    e.buttons === 1
    || e.type === 'mousedown'
  ) {
    if ($palette[i] === color)
      palette.update((p) => {
        p[i] = '#ffffff'
        return p
      })
    else
      palette.update((p) => {
        p[i] = color
        return p
      })
  }
}

function erase() {
  localStorage.removeItem('smol.xyz_createPalette')
  palette.set(new Array(Math.pow($width, 2)).fill('#ffffff'))
  name.set('')
  description.set('')
}

function mint() {
  if (!$token)
    return alert('Please log in first')

  return fetch('/create', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${$token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      palette: $palette,
      width: $width,
      name: $name,
      description: $description
    })
  })
  .then(handleResponse)
  .then(erase)
}
</script>

<div class="flex flex-col items-start">
  <label class="flex items-center mb-2">
    <span class="mr-2">Width</span>
    <input class="w-24 h-8 border-2 border-gray active:border-blue-500 rounded px-2" type="number" bind:value={$width}>
  </label>
  
  <label class="flex items-center mb-2 relative">
    <span class="mr-2">Color</span>
    <div class="z-10 w-24 h-8 border-2 border-gray rounded relative">
      <div class="absolute rounded" 
        style:top="2px" 
        style:bottom="2px" 
        style:left="2px" 
        style:right="2px" 
        style:background-color={color}
      ></div>
    </div>
    <input class="z-20 absolute top-0 right-0 opacity-0" type="color" bind:value={color}>
  </label>

  <div class="flex max-w-full">
    <div class="w-full overflow-y-scroll">
      <ul class="flex flex-wrap" 
        style:width="calc({$width} * 2rem)" 
        style:box-shadow="inset -1px -1px 0 0 #e5e7eb"
      >
        {#each $palette as hex, i (i)}
        <li class="w-8 h-8" 
          style:background-color={/ffffff/gi.test(hex) ? 'transparent' : hex}
          style:box-shadow={`inset 1px 1px 0 0 ${/ffffff/gi.test(hex) ? '#e5e7eb' : hex}`} 
          on:mousedown={(event) => colorPixel(event, i)} 
          on:mouseenter={(event) => colorPixel(event, i)}
        ></li>
        {/each}
      </ul>

      <ul class="flex mt-2 sticky left-0 bottom-0">
        {#each $colors as {hex, count} (hex)}
        <li class="flex flex-col items-center" on:click={() => color = hex}>
          <div class="w-6 h-6" 
            style:background-color="{hex}" 
            style:box-shadow={`inset 0 0 0 1px ${/ffffff/gi.test(hex) ? '#e5e7eb' : hex}`}
          ></div>
          <span class="text-sm">{count}</span>
        </li>
        {/each}
      </ul>
    </div>

    <div class="flex flex-col child:mb-2 ml-4">
      <HexGlyph class="child" palette={$palette} width={$width} px={128} />
      <HexGlyph class="child" palette={$palette} width={$width} px={64} />
      <HexGlyph class="child" palette={$palette} width={$width} px={32} />
    </div>
  </div>

  <label class="flex items-center mb-2">
    <span class="mr-2">Title</span>
    <input class="h-8 border-2 border-gray active:border-blue-500 rounded px-2" type="text" bind:value={$name}>
  </label>

  <label class="flex mb-2">
    <span class="mr-2">Story</span>
    <textarea class="border-2 border-gray active:border-blue-500 rounded px-2 py-1" style:min-height="5.25rem" rows="3" bind:value={$description}></textarea>
  </label>

  <div class="mt-2 flex child:mr-2">
    <button on:click={erase} class="child bg-black text-white py-1 px-2 rounded">Erase</button>
    <button on:click={mint} class="child bg-black text-white py-1 px-2 rounded">Save</button>
  </div>
</div>