import { text, json, status, error } from "itty-router-extras"

import { handleResponse } from '../@js/utils'

export default class LiveGlyph {
  constructor(state, env) {
    this.state = state
  }

  async fetch(req) {
    switch(req.method) {
      case 'GET':
        return this.get(req)
      case 'POST':
        return this.post(req)
    }
  }

  async get(req) {
    const prefix = 'g:'
    const glyph = await this.state.storage
    .list({prefix})
    .then((map) =>
      [...map.entries()]
      .map(([key, value]) => ({
        index: parseInt(key.split(prefix)[1]),
        ...value
      }))
    )
    
    return json(glyph)
  }
  
  async post(req) {
    const body = await req.json()
    const { id, username, index, hex } = body
    const now = Date.now()
    const timeoutUntilMilliseconds = now + 1000 * 60

    const last = await this.state.storage.get(`t:${id}`)

    if (now < last)
      return error(400, 'Not Time')

    await Promise.all([
      this.state.storage.put(`t:${id}`, timeoutUntilMilliseconds),
      this.state.storage.put(`g:${index}`, {id, username, hex})
    ])

    return status(204)
  }
}