<script>
  import { goto } from '$app/navigation'
  import { browser } from '$app/env'

  import { token, user } from '../../@store/user'

  export let data

  if (browser) {
    token.set(data.token)
    user.set(data.discord)

    localStorage.setItem('smol.xyz_token', data.token)
    goto('/', {replaceState: true})
  }
  </script>