import { Buffer } from 'buffer'
import { encodePng } from '@lunapaint/png-codec'

import { getCache, resizePng, setCache, shajs } from '../../../../@js/utils'

export async function get({ request, platform, params }) {
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
    const { hexLong, codeLong, width, size } = params

    if (!['lrg', 'med', 'sm'].includes(size))
      throw new StatusError(400, 'Size segment must be one of lrg, med or sm')

    const scale = size === 'lrg' ? 32 : size === 'med' ? 16 : 1

    const hexPalette = hexLong.match(/.{7}/g)?.map((hex) => hex.match(/.{1,6}/g))
    const codePalette = codeLong.split('')
    const height = Math.ceil(codePalette.length / width)
    const channels = 4

    let data = Buffer.alloc(width * height * channels)

    codePalette.forEach((code, i) => {
      const [hex] = hexPalette.find(([, c]) => code === c)
      let [r, g, b] = hex.substring(0, 6).match(/.{1,2}/g)
      r = parseInt(r, 16)
      g = parseInt(g, 16)
      b = parseInt(b, 16)
      const x = i % width
      const y = Math.floor(i / width)
      const pos = y * channels * width + channels * x

      data[pos] = r
      data[pos + 1] = g
      data[pos + 2] = b
      data[pos + 3] = 255
    })

    const hex = await shajs(data).then((hexBuffer) => hexBuffer.toString('hex'))

    if (!await GLYPHS.get(hex))
      await GLYPHS.put(hex, data, {metadata: {
        width,
        height,
        author: undefined,
        date: Date.now(),
        length: data.length
      }})

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
    headers,
  }
}