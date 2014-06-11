
var remotes = require('../lib/remotes')
var calculate = require('../lib/utils').shasum
var cacheControl = require('../config').cacheControl.remotes

var json = {
  hostname: require('../config').hostname,
  aliases: remotes.aliases,
  version: require('../package.json').version,
  remotes: remotes.names.map(function (name) {
    var remote = remotes[name]
    var out = {
      name: remote.name,
      hostname: remote.hostname,
      aliases: remote.aliases,
      namespace: remote.namespace !== false,
    }
    if (remote.shorthand) out.shorthand = remote.shorthand
    return out
  })
}

var hash = calculate(JSON.stringify(json, null, 2))
var mtime = new Date()

/**
 * Return a seriealized list of `remotes` to clients.
 * Note: no caching here -
 */

module.exports = function* (next) {
  if (this.request.path !== '/proxy.json') return yield* next

  this.response.etag = hash
  this.response.lastModified = mtime
  this.response.set('Cache-Control', cacheControl)
  this.response.body = json
  if (this.request.fresh) this.response.status = 304
}
