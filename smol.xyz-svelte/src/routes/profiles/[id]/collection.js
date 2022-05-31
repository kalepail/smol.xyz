import { bearer } from '@borderless/parse-authorization'
import jwt from '@tsndr/cloudflare-worker-jwt'

import { getCache, handleResponse, setCache } from "../../../@js/utils"

export async function get({request, platform, url, params}) {
  let body
  let headers
  
  const { cacheKey, cached } = await getCache(request, 'json')

  if (cached) {
    body = cached.body
    headers = cached.headers
  }

  else {
    const { context, env } = platform
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

    if (jwtData?.sub !== params.id)
      return {
        status: 401,
        body: `Not authorized to view this user's collection`
      }

    const id = DO_USERS.idFromString(jwtData.sub)
    const stub = DO_USERS.get(id)

    body = await stub.fetch(new URL(`${url.href}/collection`)).then(handleResponse)

    headers = {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=60`
    }

    setCache({
      context,
      key: cacheKey,
      body,
      headers,
    })
  }

  return {
    status: 200,
    body
  }
}