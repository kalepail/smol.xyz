import { Buffer } from 'buffer'
import { chunk, countBy } from 'lodash-es'

import { getCache, setCache } from '../../../@js/utils'

export async function get({request, url, params, platform}) {
  let body
  let headers

  const { cacheKey, cached } = await getCache(request, 'json')

  if (cached) {
    body = cached.body
    headers = cached.headers
  }

  else {
    const { env, context } = platform
    const { GLYPHS, KV_USERS } = env
    const { 
      data, 
      metadata
    } = await GLYPHS
    .getWithMetadata(params.id, {type: 'arrayBuffer'})
    .then(({value, metadata}) => {
      const data = Buffer.from(value)

      return {
        data,
        metadata
      }
    })

    try {
      const {metadata: {username}} = await KV_USERS.getWithMetadata(metadata.author)
      metadata.username = username
    } catch {}

    const palette = chunk([...data], 4)
    .map((chunk) => {
      return [
        chunk[0].toString(16).padStart(2, 0),
        chunk[1].toString(16).padStart(2, 0),
        chunk[2].toString(16).padStart(2, 0),
      ]
      .join('')
      .toUpperCase()
    })

    body = {
      path: url.href,
      palette: Object.entries(countBy(palette)).map(([hex, count]) => ({hex, count})),
      metadata
    }

    headers = {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=3600`
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
    body,
    headers
  }
}