import { StatusError, ThrowableRouter } from 'itty-router-extras'

import Users from './@do/Users'
import LiveGlyph from './@do/LiveGlyph'
// import parsePng from './api/parsePng'
// import apiTest from './api/test'

const router = ThrowableRouter()

// router.get('/', parsePng)
// router.get('/', apiTest)
// router.get('/:key', apiTest)
router.all('*', () => { throw new StatusError(404, 'Not Found') })

const handlers = { 
  fetch: (...args) => router
  .handle(...args)
  .then(res => {
    res.headers.append('Access-Control-Allow-Origin', '*') // cors ftw
    return res 
  })
  .catch((err) => {
    err = error(err.status, err?.message || err)
    err.headers.append('Access-Control-Allow-Origin', '*') // cors ftw
    return err
  })
}

export { 
  handlers as default, 
  Users, 
  LiveGlyph 
}