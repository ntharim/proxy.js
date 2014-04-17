
var calculate = require('../utils').shasum
var remotes = require('../lib/remotes')

var json = {
  hostname: require('../config').hostname,
  remotes: Object.keys(remotes).map(function (remote) {
    return {
      name: remote.name,
      hostname: remote.hostname,
      aliases: remote.aliases,
    }
  })
}

var hash = calculate(JSON.stringify(json, null, 2))
var mtime = new Date()
var cacheControl = 'public, max-age='
  + require('../config').maxAge.remotes

/**
 * Return a seriealized list of `remotes` to clients.
 * Note: no caching here -
 */

module.exports = function* (next) {
  if (this.request.path !== '/remotes.json') return yield* next

  this.response.etag = hash
  this.response.lastModified = mtime
  this.response.set('Cache-Control', cacheControl)
  this.response.body = json
  if (this.request.fresh) this.response.status = 304
}
