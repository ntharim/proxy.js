
var debug = require('debug')('normalize-proxy:resolve');
var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec
var semver = require('semver');
var url = require('url');
var fs = require('fs');

var remotes = require('./remotes');
var utils = require('./utils');

module.exports = resolve;

var ee = new EventEmitter()
ee.setMaxListeners(0)
var installing = Object.create(null)
ee.await = function (event) {
  return function (done) {
    ee.on(event, done)
  }
}

var entrypoints = [
  'index.html',
  'index.css',
  'index.js',
]

/**
 * Resolve a <hostname>/<user/<project>/<version>/ URL.
 *
 * @param {String} uri
 * @return {Object} file
 * @api private
 */

function* resolve(uri) {
  debug('resolving %s', uri)
  if (!~uri.indexOf('://')) throw new Error('URI must be a remote URI.');
  uri = url.parse(uri);
  var remote = remotes(uri.hostname);
  if (!remote) throw new Error('Unsupported hostname: ' + uri.hostname);

  var frags = uri.pathname.split('/');
  var owner = frags[1].toLowerCase();
  var project = frags[2].toLowerCase();
  var range = frags[3].toLowerCase();
  var tail = frags.slice(4);
  var remoteURI = utils.remotePath(remote, owner, project, range);
  if (!semver.validRange(range))
    throw new Error('Invalid semantic version: ' + remoteURI);

  var out = utils.localPath(remote, owner, project, '');
  var versions = yield* versionsOf(out);
  var version = semver.maxSatisfying(versions, range);
  var out;
  if (version) {
    out += version;
    // if the folder exists, but the repository is currently being installed,
    // then we wait for it to install
    if (installing[out]) {
      debug('waiting to be installed: %s', out)
      yield ee.await(out)
    }
  } else {
    var repo = owner + '/' + project;
    debug('resolving %s/%s@%s', remote.hostname, repo, range);
    // not installed,
    // so we install the latest that satisfies this range
    // To do: make sure someone can't DDOS us by spamming invalid versions.
    versions = yield* remote.versions(repo, range);
    if (!versions.length) throw new Error('No versions found for: ' + remoteURI)
    version = semver.maxSatisfying(versions, range);
    if (!version) throw new Error('No satisfying versions found: ' + remoteURI);
    out += utils.strictVersion(version);
    installing[out] = true // mark as installing
    try {
      yield* remote.download(repo, version, out);
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
    version = utils.strictVersion(version);
    if (yield* invalidPackage(out)) throw new Error('No entry points found: ' + remoteURI)
  }

  return [remote, owner, project, version, tail];
}

function* invalidPackage(path) {
  for (var i = 0; i < entrypoints.length; i++)
    if (yield exists(path + '/' + entrypoints[i]))
      return false
  return true
}

// each version is stored in a nested directory
function* versionsOf(path) {
  return (yield readdir(path))
    .filter(notHidden)
    .sort(semver.rcompare);
}

function readdir(path) {
  return function (done) {
    fs.readdir(path, function (err, dirs) {
      done(null, dirs || []);
    });
  }
}

function exists(path) {
  return function (done) {
    fs.exists(path, done.bind(null, null))
  }
}

function notHidden(x) {
  return x[0] !== '.';
}

function noop() {}
