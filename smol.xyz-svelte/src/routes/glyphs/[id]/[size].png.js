import { encodePng } from '@lunapaint/png-codec'
import { Buffer } from 'buffer'

import { getCache, resizePng, setCache } from '../../../@js/utils'

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
    const { id, size} = params
    const channels = 4

    if (!['lrg', 'med', 'sm'].includes(size))
      throw new StatusError(400, 'Size segment must be one of lrg, med or sm')

    const scale = size === 'lrg' ? 32 : size === 'med' ? 16 : 1

    let { data, width, height } = await GLYPHS
    .getWithMetadata(id, {type: 'arrayBuffer'})
    .then(({value, metadata}) => {
      const data = Buffer.from(value)
      const { width, height } = metadata

      return {
        data,
        width,
        height
      }
    })

    if (scale > 1)
      data = resizePng({
        ogData: data,
        ogWidth: width,
        ogHeight: height,
        width: width * scale,
        height: height * scale,
        channels
      })

    imageBuffer = await encodePng({ 
      data, 
      width: width * scale,
      height: height * scale,
      bitDepth: 8,
      colorType: 2,
      ancillaryChunks: {}
    })
    .then(({data}) => Buffer.from(data))

    headers = {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=2419200', // 28 days
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
    headers
  }
}