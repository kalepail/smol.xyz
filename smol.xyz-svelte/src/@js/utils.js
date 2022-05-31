import { Buffer } from 'buffer'

export async function handleResponse(response) {
  const isResponseJson = response.headers.get('content-type')?.indexOf('json') > -1
  
  if (response.ok)
    return isResponseJson
    ? response.json() 
    : response.text()

  throw isResponseJson
  ? {
    ...await response.json(),
    status: response.status
  }
  : await response.text()
}

export function shajs(data) {
  return crypto.subtle.digest(
    {name: 'SHA-256'},
    Buffer.from(data)
  ).then(Buffer.from)
}

export function resizePng({
  ogData, 
  ogWidth, 
  ogHeight,
  width,
  height,
  channels
}) {
  const data = Buffer.alloc(width * height * channels)

  for (let i = 0; i < width; i++) {
    let tx = i / width,
        ssx = Math.floor(tx * ogWidth)

    for (let j = 0; j < height; j++) {
      let ty = j / height,
          ssy = Math.floor(ty * ogHeight),
          indexO = (ssx + ogWidth * ssy) * 4,
          indexC = (i + width * j) * 4,
          rgbaO = [
            ogData[indexO],
            ogData[indexO + 1],
            ogData[indexO + 2],
            ogData[indexO + 3]
          ]
          
      data[indexC] = rgbaO[0]
      data[indexC + 1] = rgbaO[1]
      data[indexC + 2] = rgbaO[2]
      data[indexC + 3] = rgbaO[3]
    }
  }

  return data
}

export async function getCache(request, bodyType) {
  const cache = caches.default
  const cacheUrl = new URL(request.url)
  const cacheKey = new Request(cacheUrl.toString(), request)

  const response = await cache.match(cacheKey)

  if (response) return {
    cacheKey,
    cached: {
      body: await response[bodyType]().then((body) => bodyType === 'arrayBuffer' ? Buffer.from(body) : body),
      headers: response.headers
    }
  }

  return { cacheKey }
}

export function setCache({
  context,
  key,
  body,
  headers
}) {
  const cache = caches.default

  body = (
    body !== null
    && typeof body === 'object' 
    && !Buffer.isBuffer(body)
  )
  ? JSON.stringify(body)
  : body

  context.waitUntil(cache.put(key, new Response(body, { headers })))
}