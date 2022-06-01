<script>
import { derived } from 'svelte/store';
import { goto } from '$app/navigation'
import { browser } from '$app/env'

import { token, tokenPayload, user } from '../@store/user'
import { width, height } from '../@store/filter'

const homeUrl = derived([width, height], ([w, h]) => {
  let hu = '/'

  if (w && w !== 'any') {
    hu += `?w=${w}`

    if (h && h !== 'any')
      hu += `&h=${h}`
  }

  return hu
})

let oauthUrl

if (browser)
  oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=977204901711077386&redirect_uri=${encodeURIComponent(`${location.origin}/callback`)}&response_type=code&scope=identify%20email&prompt=none`

function logOut() {
  localStorage.removeItem('smol.xyz_token')
  token.set(null)
  user.set(null)
  goto('/', {replaceState: true})
}
</script>

<header class="flex mb-2">
  <a href="{$homeUrl}">
    <h1 class="text-xl font-bold hover:underline">smol.xyz</h1>
  </a>

  <div class="flex items-center ml-auto">
    <a class="ml-2 hover:underline text-white bg-red-500 rounded px-2 py-1 uppercase text-sm" href="/live">Live</a>

    <a class="ml-2 hover:underline" href="/create">Create</a>

    {#if $tokenPayload}
      <a class="ml-2 hover:underline" href="/profiles/{$tokenPayload.sub}">Profile {$user?.loms ? `(${$user?.loms} Ł)` : ''}</a>
    {/if}

    {#if $token}
      <button class="pointer hover:underline ml-2" on:click="{logOut}">Log out</button>
    {:else}
      <a class="ml-2 hover:underline" href="{oauthUrl}">Log in</a>
    {/if}
  </div>
</header>