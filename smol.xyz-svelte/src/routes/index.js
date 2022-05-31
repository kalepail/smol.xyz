import { getCache, setCache } from "../@js/utils"

export async function get({ request, platform, url }) {
  let body
  let headers

  const { cacheKey, cached } = await getCache(request, 'json')
  const { context, env } = platform
  const { searchParams } = url
  const { w, h, c, l = 1000 } = Object.fromEntries(searchParams)

  if (cached) {
    body = cached.body
    headers = cached.headers
  }

  else {
    const { GLYPHS } = env

    let prefix = ''
    
    if (w)
      prefix += `${w}-`
    if (h)
      prefix += `${h}-`

    const { keys, cursor, list_complete } = await GLYPHS.list({prefix, cursor: c, limit: l})  

    body = {
      now: Date.now(),
      glyphs: keys.map(({name}) => name),
      cursor,
      list_complete
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
    body: {
      ...body,
      w,
      h,
    },
    headers
  }
}