
var debug = require('debug')('normalize-proxy:resolve');
var semver = require('semver');
var url = require('url');
var fs = require('fs');

var remotes = require('./remotes');
var utils = require('./utils');

module.exports = resolve;

/**
 * Resolve a <hostname>/<user/<project>/<version>/ URL.
 *
 * @param {String} uri
 * @return {Object} file
 * @api private
 */

function* resolve(uri) {
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
  if (!semver.valid(range))
    throw new Error('Invalid semantic version: ' + remoteURI);

  var out = utils.localPath(remote, owner, project, '');
  var versions = yield* versionsOf(out);
  var version = semver.maxSatisfying(versions, range);
  var out;
  if (version) {
    out += version;
  } else {
    var repo = owner + '/' + project;
    debug('resolving %s/%s@%s', remote.hostname, repo, range);
    // not installed,
    // so we install the latest that satisfies this range
    // To do: make sure someone can't DDOS us by spamming invalid versions.
    versions = yield* remote.versions(repo, range);
    version = semver.maxSatisfying(versions, range);
    if (!version) throw new Error('No satisfying versions found: ' + remoteURI);
    out += utils.strictVersion(version);
    // to do: locking so downloads don't happen multiple times.
    yield* remote.download(repo, version, out);
    version = utils.strictVersion(version);
  }

  return [remote, owner, project, version, tail];
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

function notHidden(x) {
  return x[0] !== '.';
}
