
var fs = require('fs')
var url = require('url')
var crypto = require('crypto')

var remotes = require('./remotes')
var config = require('../config')

var entrypoints = [
  'index.html',
  'index.css',
  'index.js',
]

/**
 * Every package must have an entry point!
 *
 * @param {String} path
 * @return {Boolean}
 * @api public
 */

exports.invalidPackage = function* (path) {
  for (var i = 0; i < entrypoints.length; i++)
    if (yield exists(path + '/' + entrypoints[i]))
      return false
  return true
}

/**
 * Return the supported entry points of a package.
 *
 * @param {String} path
 * @return {Boolean}
 * @api public
 */

exports.entrypoints = function* (path) {
  if (path.slice(-1) !== '/') path += '/'
  var out = []
  yield entrypoints.map(function (file) {
    return function* () {
      if (yield exists(path + file)) out.push(file)
    }
  })
  return out
}

/**
 * /User/jong/repositories/github.com/component/emitter/1.0.0/index.js
 * to
 * https://github.normalize.us/component/emitter/1.0.0/index.js
 *
 * @param {String} uri
 * @return {String}
 * @api public
 */

exports.localToRemotePath = function (uri) {
  uri = uri.replace(config.store, '');
  var frags = uri.split('/');
  var remote = remotes(frags[0]);
  if (!remote) throw new Error('Unsupported hostname: ' + frags[0]);
  return exports.remotePath(remote, frags[1], frags[2], frags[3], frags.slice(4));
}

/**
 * https://github.normalize.us/component/emitter/1.0.0/index.js
 * to
 * /User/jong/repositories/github.com/component/emitter/1.0.0/index.js
 *
 * @param {String} uri
 * @return {String}
 * @api public
 */

exports.remoteToLocalPath = function (uri) {
  uri = url.parse(uri);
  var remote = remotes(uri.hostname);
  if (!remote) throw new Error('Unsupported hostname: ' + uri.hostname);
  var frags = uri.pathname.split('/');
  return exports.localPath(remote, frags[1], frags[2], frags[3], frags.slice(4));
}

/**
 * Get /User/jong/repositories/github.com/component/emitter/1.0.0/index.js
 * or something.
 *
 * @param {Object|String} remote
 * @param {String} owner
 * @param {String} repo
 * @param {String} version
 * @return {String}
 * @api public
 */

exports.localPath = function (remote, owner, repo, version, tail) {
  return config.store
    + remote.domain
    + '/' + owner
    + '/' + repo
    + '/' + (version || '')
    + rest(tail);
}

/**
 * Get https://github.com/component/emitter/1.0.0/index.js
 * or something.
 *
 * @param {Object|String} remote
 * @param {String} owner
 * @param {String} repo
 * @param {String} version
 * @return {String}
 * @api public
 */

exports.remotePath = function (remote, owner, repo, version, tail) {
  return 'https://'
    + remote.hostname
    + '/' + owner
    + '/' + repo
    + '/' + (version || '')
    + rest(tail);
}

/**
 * Remove leading ='s and v's in versions
 * because they are annoying.
 *
 * @param {String} version
 * @return {String} version
 * @api private
 */

exports.strictVersion = function (version) {
  var first = version[0];
  return first === 'v' || first === '='
    ? version.slice(1)
    : version;
}

/**
 * Replace a string with another string within comments.
 * Note: this should be replaced by better implementations on a per-type basis.
 *
 * @param {String} text
 * @param {String} match
 * @param {String} replace
 * @return {String}
 * @api private
 */

exports.replaceStrings = function (text, match, replace) {
  var re = new RegExp('[\'"]' + escapeRegExp(match) + '[\'"]', 'g');
  return text.replace(re, '"' + replace + '"');
}

/**
 * Base64 sha256sum of a string.
 *
 * @param {String}
 * @return {String}
 * @api public
 */

exports.shasum = function (string) {
  return crypto.createHash('sha256').update(string).digest('base64')
}

/**
 * Convert a rest string or array into an appropriate URL tail.
 *
 * @param {Array|String} rest
 * @return {String} tail
 * @api private
 */

function rest(params) {
  if (Array.isArray(params)) params = params.join('/');
  if (!params) return '';
  if (params[0] !== '/') params = '/' + params;
  return params;
}

/**
 * Escape regexp special characters in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

function escapeRegExp(str){
  return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
}

function exists(path) {
  return function (done) {
    fs.exists(path, done.bind(null, null))
  }
}
