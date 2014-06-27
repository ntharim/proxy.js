
var debug = require('debug')('normalize-proxy:resolve')
var EventEmitter = require('events').EventEmitter
var exec = require('child_process').exec
var semver = require('semver')
var fs = require('mz/fs')

// fucking circular dependency!
module.exports = resolve

var strictVersion = require('./utils').strictVersion
var versionsOf = require('./versions')
var normalize = require('./normalize')
var uris = require('./uri')

/**
 * Locking mechanism for installs so that only one
 * install occurs at a time. Only valid per-process,
 * obviously, so you should avoid creating multi-process proxies.
 */

var ee = new EventEmitter()
ee.setMaxListeners(0)
var installing = Object.create(null)
ee.await = require('await-event')

/**
 * Resolve a <hostname>/<user/<project>/<version>/ URL.
 *
 * @param {String} uri
 * @return {Object} file
 * @api private
 */

function* resolve(uri) {
  if (!Array.isArray(uri)) uri = uris.parseRemote(uri)
  debug('resolving %s', uri)

  var remote = uri[0]
  var owner = uri[1]
  var project = uri[2]
  var range = decodeURIComponent(uri[3])
  var tail = uri[4]
  var remoteURI = uris.remote(uri)
  if (!semver.validRange(range)) {
    var err = new Error('Invalid semantic version: ' + remoteURI)
    err.status = 400
    throw err
  }

  // to avoid circular resolve issues,
  // if tail exists and the version is strict,
  // just make sure that file exists.
  // note that this may fail if multiple resolutions occur on the same entry point
  // that is currently being rewritten by normalization
  if (tail && semver.valid(range, true)) {
    var localURI = uris.local(uri)
    if (yield fs.exists(localURI)) {
      debug('%s exists, skipping resolve', localURI)
      return uri
    }
  }

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
    // To do: do state checking so we don't unnecessarily use HTTP requests
    versions = yield* remote.versions(repo, range)
    if (!versions.length) {
      var err = new Error('No versions found for: ' + remoteURI)
      err.status = 404
      throw err
    }
    version = semver.maxSatisfying(versions, range)
    if (!version) {
      var err = new Error('No satisfying versions found: ' + remoteURI)
      err.status = 404
      throw err
    }
    out += strictVersion(version)

    if (installing[out]) {
      debug('waiting to be installed: %s', out)
      yield ee.await(out)
    } else {
      installing[out] = true // mark as installing
      debug('installing %s/%s@%s to %s', remote.hostname, repo, version, out)
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
      debug('downloaded %s', out)
      yield* normalize(out)
      debug('normalized %s', out)
      ee.emit(out)
      debug('installed %s/%s@%s', remote.hostname, repo, version)
      version = strictVersion(version)
    }
  }

  return [remote, owner, project, version, tail]
}

function noop() {}
