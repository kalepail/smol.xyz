import jwt from '@tsndr/cloudflare-worker-jwt'
import { pick } from 'lodash-es'

import { handleResponse } from "../../@js/utils"

export async function get({ platform, url }) {
  const { env } = platform
  const { origin, pathname } = url
  const { KV_USERS, DO_USERS, JWT_TOKEN, DISCORD_ID, DISCORD_SECRET } = env
  const code = url.searchParams.get('code')

  const txBody = new FormData()
        txBody.append('client_id', DISCORD_ID)
        txBody.append('client_secret', DISCORD_SECRET)
        txBody.append('grant_type', 'authorization_code')
        txBody.append('code', code)
        txBody.append('redirect_uri', `${origin}${pathname}`)

  const { access_token } = await fetch(`https://discord.com/api/oauth2/token`, {
    method: 'POST',
    body: txBody 
  })
  .then(handleResponse)

  const provider = 'discord'
  
  let user = await fetch(`https://discord.com/api/users/@me`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
  .then(handleResponse)

  const userId = await KV_USERS.get(user.id)
  const id = userId ? DO_USERS.idFromString(userId) : DO_USERS.idFromName(user.id)
  const stub = DO_USERS.get(id)

  let created = false

  await KV_USERS.put(id.toString(), user.id, {metadata:{...pick(user, ['username', 'avatar', 'discriminator'])}})

  try {
    user = {
      ...user,
      ...await stub.fetch(new URL(`${url.href}/p:${user.id}`)).then(handleResponse),
      loms: user.loms | 100
    }
  }

  catch {
    await Promise.all([
      KV_USERS.put(user.id, id.toString()),

      stub.fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          method: 'createUser',
          loms: 100,
          provider,
          ...user,
        })
      }).then(handleResponse)
    ])

    created = true
  }

  const now = Math.floor(Date.now() / 1000)

  return {
    status: 200,
    body: {
      created,
      data: {
        token: await jwt.sign({
          id: user.id,
          sub: id.toString(),
          usr: user.username,
          iat: now,
          exp:  Math.floor(now + (7 * 24 * 60 * 60)) // expires in 7 days
        }, JWT_TOKEN),
        [provider]: user
      }
    }
  }
}