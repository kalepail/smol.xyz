import { bearer } from '@borderless/parse-authorization'
import jwt from '@tsndr/cloudflare-worker-jwt'

import '../../@js/date'
import { handleResponse } from '../../@js/utils'

export async function get({platform, url}) {
  const { env } = platform
  const { LIVE_GLYPH } = env

  const now = new Date()
  const weekOfYear = now.getWeek()
  const yearOfWeek = now.getWeekYear()

  const id = LIVE_GLYPH.idFromName(`${yearOfWeek}:${weekOfYear}`)
  const stub = LIVE_GLYPH.get(id)

  const glyph = await stub.fetch(url).then(handleResponse)

  return {
    status: 200,
    body: {
      glyph
    }
  }
}

export async function post({request, url, platform}) {
  const { env } = platform
  const { JWT_TOKEN, LIVE_GLYPH } = env
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
  const { index, hex } = body

  const now = new Date()
  const weekOfYear = now.getWeek()
  const yearOfWeek = now.getWeekYear()

  const id = LIVE_GLYPH.idFromName(`${yearOfWeek}:${weekOfYear}`)
  const stub = LIVE_GLYPH.get(id)

  await stub.fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      id: jwtData.sub,
      username: jwtData.usr,
      index,
      hex
    })
  }).then(handleResponse)

  return {
    status: 200,
    body: 'OK'
  }
}