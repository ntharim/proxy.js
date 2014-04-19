
var debug = require('debug')('normalize-proxy:resolve')
var EventEmitter = require('events').EventEmitter
var exec = require('child_process').exec
var semver = require('semver')

var invalidPackage = require('./entrypoints').invalidPackage
var strictVersion = require('./utils').strictVersion
var versionsOf = require('./versions')
var uris = require('./uri')

module.exports = resolve

/**
 * Locking mechanism for installs so that only one
 * install occurs at a time. Only valid per-process,
 * obviously, so you should avoid creating multi-process proxies.
 */

var ee = new EventEmitter()
ee.setMaxListeners(0)
var installing = Object.create(null)
ee.await = function (event) {
  return function (done) {
    ee.on(event, done)
  }
}

/**
 * Resolve a <hostname>/<user/<project>/<version>/ URL.
 *
 * @param {String} uri
 * @return {Object} file
 * @api private
 */

function* resolve(uri) {
  debug('resolving %s', uri)
  if (!Array.isArray(uri)) uri = uris.parseRemote(uri)

  var remote = uri[0]
  var owner = uri[1]
  var project = uri[2]
  var range = uri[3]
  var tail = uri[4]
  var remoteURI = uris.remote(uri)
  if (!semver.validRange(range))
    throw new Error('Invalid semantic version: ' + remoteURI)

  var out = uris.local(remote, owner, project, '')
  var versions = yield* versionsOf(out)
  var version = semver.maxSatisfying(versions, range)
  var out
  if (version) {
    out += version
    // if the folder exists, but the repository is currently being installed,
    // then we wait for it to install
    if (installing[out]) {
      debug('waiting to be installed: %s', out)
      yield ee.await(out)
    }
  } else {
    var repo = owner + '/' + project
    debug('resolving %s/%s@%s', remote.hostname, repo, range)
    // not installed,
    // so we install the latest that satisfies this range
    // To do: make sure someone can't DDOS us by spamming invalid versions.
    versions = yield* remote.versions(repo, range)
    if (!versions.length) throw new Error('No versions found for: ' + remoteURI)
    version = semver.maxSatisfying(versions, range)
    if (!version) throw new Error('No satisfying versions found: ' + remoteURI)
    out += strictVersion(version)
    installing[out] = true // mark as installing
    try {
      yield* remote.download(repo, version, out)
    } catch (err) {
      // delete the folder
      exec('rm -rf ' + out, noop)
      // will emit an error on any listeners
      ee.emit(out, err)
      throw err
    } finally {
      delete installing[out]
    }
    ee.emit(out)
    debug('installed %s/%s@%s', remote.hostname, repo, version)
    version = strictVersion(version)
    if (yield* invalidPackage(out)) throw new Error('No entry points found: ' + remoteURI)
  }

  return [remote, owner, project, version, tail]
}

function noop() {}
