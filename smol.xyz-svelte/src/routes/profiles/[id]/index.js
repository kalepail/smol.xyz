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
    const { env, context } = platform
    const { DO_USERS } = env

    const id = DO_USERS.idFromString(params.id)
    const stub = DO_USERS.get(id)

    const glyphs = await stub.fetch(new URL(`${url.href}/glyphs`)).then(handleResponse)

    body = {
      glyphs
    }

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