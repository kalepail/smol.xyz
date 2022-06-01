<script>
import { writable } from 'svelte/store'
import { onDestroy, onMount } from 'svelte'

import { token } from '../../@store/user'
import { handleResponse } from '../../@js/utils';

export let glyph

const width = 8
const palette = writable([])

let color = '#000000'
let interval

onMount(() => {
  palette.update((p) =>
    new Array(Math.pow(width, 2)).fill('#ffffff').map((white, i) => {
      const found = glyph.find(({index}) => index === i)
      return found?.hex || p[i] || white
    })
  )

  interval = setInterval(() => {
    fetch(`${location.href}/__data.json`)
    .then(handleResponse)
    .then((res) => {
      glyph = res.glyph

      palette.update((p) =>
        new Array(Math.pow(width, 2)).fill('#ffffff').map((white, i) => {
          const found = glyph.find(({index}) => index === i)
          return found?.hex || p[i] || white
        })
      )
    })
  }, 1000)
})

onDestroy(() => clearInterval(interval))

function colorPixel(e, i) {
  if (
    e.buttons === 1
    || e.type === 'mousedown'
  ) {
    if (!$token)
      return alert('Please log in first')

    const ogc = String($palette[i])

    palette.update((p) => {
      p[i] = color
      return p
    })
    
    fetch(location.href, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${$token}`
      },
      body: JSON.stringify({
        index: i,
        hex: color
      })
    })
    .then(handleResponse)
    .catch(() => {
      palette.update((p) => {
        p[i] = ogc
        return p
      })

      alert('Too fast! Please wait a minute before placing another pixel')
    })
  }
}
</script>

<div class="flex flex-col items-start">
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
        style:width="calc({width} * 2rem)" 
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
    </div>
  </div>
</div>