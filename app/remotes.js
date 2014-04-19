
var remotes = require('../lib/remotes')
var calculate = require('../lib/utils').shasum
var cacheControl = require('../config').cacheControl.remotes

var json = {
  hostname: require('../config').hostname,
  remotes: Object.keys(remotes).map(function (name) {
    var remote = remotes[name]
    return {
      name: remote.name,
      hostname: remote.hostname,
      aliases: remote.aliases,
    }
  })
}

var hash = calculate(JSON.stringify(json, null, 2))
var mtime = new Date()

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
