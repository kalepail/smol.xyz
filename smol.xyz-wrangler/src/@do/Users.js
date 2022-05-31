import { text, json, status } from "itty-router-extras"

import { handleResponse } from '../@js/utils'

export default class Users {
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
    const id = req.url.split('/').reverse()[0]

    switch(id) {
      case 'glyphs':
      return this.getGlyphs('g:')
      case 'collection':
      return this.getGlyphs('c:')
      default:
      return this.getKey(id)
    }
  }
  
  async post(req) {
    const body = await req.json()
    const { method } = body

    delete body.method

    await this[method](body)

    return status(204)
  }

  async getGlyphs(prefix) {
    const glyphs = await this.state.storage
    .list({prefix})
    .then((map) =>
      [...map.keys()]
      .map((key) => key.split(prefix)[1])
    )
    
    return json(glyphs)
  }

  async getKey(id) {
    const value = await this.state.storage.get(id)

    return !value
    ? status(404)
    : typeof value === 'string'
    ? text(value)
    : json(value)
  }

  async createUser(body) {
    try {
      await this.get().then(handleResponse)
    } catch {
      return this.state.storage.put(`p:${body.id}`, body) // create a provider 
    }
  }
  
  async createGlyph(body) {
    const key = `p:${body.userId}`
    const user = await this.state.storage.get(key)

    await this.state.storage.put(key, {
      ...user,
      loms: (user.loms || 100) - body.width - body.height
    })

    return this.state.storage.put(`g:${body.glyphId}`, 1) // create a glyph
  }

  async collectGlyph(body) {
    return this.state.storage.put(`c:${body.id}`, 1) // collect a glyph
  }
}