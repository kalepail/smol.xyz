import jwt from '@tsndr/cloudflare-worker-jwt'
import { bearer } from '@borderless/parse-authorization'

import { handleResponse } from "../../../@js/utils"

export async function get({request, url, platform}) {
  const { DO_USERS, JWT_TOKEN } = platform.env
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

  const id = DO_USERS.idFromString(jwtData.sub)
  const stub = DO_USERS.get(id)

  const user = await stub.fetch(new URL(`${url.href}/p:${jwtData.id}`)).then(handleResponse)

  return {
    status: 200,
    body: {
      ...user,
      loms: user.loms || 100
    }
  }
}