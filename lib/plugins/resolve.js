
var debug = require('debug')('normalize-proxy:plugins:resolve')

var _resolve = require('../resolve')
var uris = require('../uri')

/**
 * Resolved the semver dependencies and
 * makes sure that the dependency is installed.
 */

module.exports = function () {
  return function* resolveDependency(next) {
    // make sure every dependency has a remote URI
    var remoteURI = this.remote
    if (!remoteURI) throw new Error('No remote URI?!')
    yield* resolve(this)

    yield* next

    var file = this.file
    // these files are never stale
    // because they never change,
    // so we overwrite the original prototype method.
    file.stale = noop
    var ext = file.is('js')

    // resolve all the URIs of the dependencies
    var fns = []
    var deps = file.dependencies
    Object.keys(deps).forEach(function (name) {
      fns.push(resolve(deps[name], ext))
    })
    yield fns
  }
}

function* resolve(dep, ext) {
  if (dep.resolved) return
  var res = yield* _resolve(dep.remote)
  dep.uri = uris.local(res)
  dep.remote = uris.remote(res)
  dep.resolved = true
}

function* noop() {/* jshint noyield:true */}
