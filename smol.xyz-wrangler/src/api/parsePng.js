import { decodePng } from '@lunapaint/png-codec'
import { chunk } from 'lodash-es'

const ALPHABET = `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!$&'()*+,-:;=@[]^_|~`.split('')

// Twitter 4088 length limit

export default async function parsePng(req, env, ctx) {
  const { origin } = new URL(req.url)
  const { uri } = req.query

  return fetch(decodeURIComponent(uri))
  .then(async (res) => {
    if (res.ok) {
      let codeLong = ''
      let hexLong = ''

      const colorMap = {}
      const {image: {data, width, channels = 4}} = await decodePng(Buffer.from(await res.arrayBuffer()))

      chunk(data, channels).forEach((dataChunk) => {
        const [r, g, b] = dataChunk
        const hex = [
          r.toString(16).padStart(2, 0),
          g.toString(16).padStart(2, 0),
          b.toString(16).padStart(2, 0),
        ].join('')
        let code

        if (colorMap.hasOwnProperty(hex)) {
          code = colorMap[hex]
        } else {
          code = ALPHABET[Object.keys(colorMap).length] || ALPHABET[0]
          colorMap[hex] = code
          hexLong += hex + code
        }

        codeLong += code
      })

      return new Response(`${origin}/${hexLong}/${codeLong}/${width}/lrg`, {
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60', // 1 minute
        }
      }) 
      
      // return Response.redirect(`${origin}/${hexLong}/${codeLong}/${width}.png`, 307);
    }
      
    throw res
  })
}