import jwt from '@tsndr/cloudflare-worker-jwt'
import { bearer } from '@borderless/parse-authorization'
import { Buffer } from 'buffer'

import { handleResponse, shajs } from '../../@js/utils'

export async function post({ request, url, platform }) {
  const { env } = platform
  const { JWT_TOKEN, GLYPHS, DO_USERS } = env
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

  const body = await request.json()
  const { palette, width, name, description } = body
  const { sub, id: userId } = jwtData
  const height = Math.ceil(palette.length / width)
  const channels = 4

  let data = Buffer.alloc(width * height * channels)

  palette.forEach((hex, i) => {
    let [r, g, b] = hex.replace('#', '').match(/.{1,2}/g)
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

  if (!await GLYPHS.get(hex)) {
    const id = DO_USERS.idFromString(sub)
    const stub = DO_USERS.get(id)
    const glyphId = `${width}-${height}-${hex}`

    await stub.fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        method: 'createGlyph',
        width,
        height,
        userId,
        glyphId
      })
    }).then(handleResponse)

    await GLYPHS.put(glyphId, data, {metadata: {
      width,
      height,
      name,
      description,
      author: sub,
      date: Date.now(),
      length: data.length
    }})
  }

  return {
    status: 200,
    body: 'OK',
  }
}