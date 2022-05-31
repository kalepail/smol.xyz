import { Buffer } from 'buffer'
import { encodePng } from '@lunapaint/png-codec'

import { getCache, setCache } from '../../../@js/utils'

export async function get({request, params, platform}) {
  let imageBuffer
  let headers

  const { cacheKey, cached } = await getCache(request, 'arrayBuffer')

  if (cached) {
    imageBuffer = cached.body
    headers = cached.headers
  }

  else {
    const { env, context } = platform
    const { GLYPHS } = env
    const { data, width, height } = await GLYPHS
    .getWithMetadata(params.id, {type: 'arrayBuffer'})
    .then(({value, metadata}) => {
      const data = Buffer.from(value)
      const { width, height } = metadata

      return {
        data,
        width,
        height
      }
    })

    imageBuffer = await encodePng({ 
      data,
      width,
      height,
      bitDepth: 8,
      colorType: 2,
      ancillaryChunks: {}
    })
    .then(({data}) => Buffer.from(data))

    headers = {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': `public, max-age=2419200`
    }

    setCache({
      context,
      key: cacheKey,
      body: imageBuffer,
      headers,
    })
  }

  return {
    status: 200,
    body: imageBuffer,
    headers,
  }
}