
var debug = require('debug')('normalize-proxy:plugins:resolve')

var resolve = require('../resolve')
var uris = require('../uri')

/**
 * Resolved the semver dependencies and
 * makes sure that the dependency is installed.
 */

module.exports = function () {
  return function* resolveDependency(next) {
    if (!this.remoteURI) throw new Error('No remote URI?!')

    debug('got remote URI: %s', this.remoteURI)

    var res = yield* resolve(this.remoteURI)
    this.uri = uris.local(res)
    this.remoteURI = uris.remote(res)

    debug('resolving dependency: %s', this.remoteURI)

    yield* next

    // these files are never stale
    // because they never change,
    // so we overwrite the original prototype method.
    this.file.stale = noop
  }
}

function* noop() {/* jshint noyield:true */}
