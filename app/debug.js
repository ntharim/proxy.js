
var debug = require('debug')('normalize-proxy:app')
var inspect = require('util').inspect

module.exports = function* (next) {
  debug('spdy: ' + this.req.isSpdy)
  debug('spdy version: ' + this.req.spdyVersion)
  debug('request: ' + inspect(this.request.header))
  yield* next
  debug('response: ' + inspect(this.response.header))
}
