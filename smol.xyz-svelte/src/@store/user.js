import { browser } from '$app/env'
import { derived, writable } from 'svelte/store'

import { handleResponse } from '../@js/utils'

export const token = writable(null)
export const user = writable(null)
export let tokenPayload

if (browser) {
  const t = localStorage.getItem('smol.xyz_token')

  if (t) {
    token.set(t)

    fetch('/api/users/get', {
      headers: {
        Authorization: `Bearer ${t}`
      }
    })
    .then(handleResponse)
    .then((res) => user.set(res))
    .catch(() => {
      localStorage.removeItem('smol.xyz_token')
      token.set(null)
    })
  }

  tokenPayload = derived(token, (t) => {
    if (t) {
      const [, payload] = t.split('.')

      return JSON.parse(atob(payload))
    }
  })
}