import jwt from '@tsndr/cloudflare-worker-jwt'
import { bearer } from '@borderless/parse-authorization'

import { handleResponse } from '../../../@js/utils'

export async function post({ request, platform, params, url }) {
  const { env } = platform
  const { JWT_TOKEN, DO_USERS } = env
  const token = bearer(request.headers.get('authorization') || '')
  
  let jwtData

  try {
    await jwt.verify(token, JWT_TOKEN)
    jwtData = await jwt.decode(token)
  } catch {
    return { 
      status: 401, 
      body: `Invalid or expired authorization token` 
    }
  }

  const { sub } = jwtData
  const id = DO_USERS.idFromString(sub)
  const stub = DO_USERS.get(id)

  await stub.fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      method: 'collectGlyph',
      id: params.id
    })
  }).then(handleResponse)

  return {
    status: 200,
    body: 'OK'
  }
}