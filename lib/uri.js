
var url = require('url')

var remotes = require('./remotes')
var config = require('../config')

/**
 * Parse a local URI into an array of fragments.
 *
 * @param {String} uri
 * @return {Array}
 * @api public
 */

exports.parseLocal = function (uri) {
  uri = uri.replace(config.store, '')
  var frags = uri.split('/')
  var remote = remotes(frags[0])
  return [
    remote,
    frags[1].toLowerCase(),
    frags[2].toLowerCase(),
    frags[3].toLowerCase(),
    frags.slice(4)
  ]
}

/**
 * Parse a URI into an array of fragments.
 * To do: check hostname
 *
 * @param {String} uri
 * @return {Array}
 * @api public
 */

exports.parseRemote = function (uri) {
  uri = url.parse(uri)
  var hostname = uri.hostname
  var frags = uri.pathname.split('/')
  frags.shift()
  // support github.com/user/repo urls
  if (hostname && !~remotes.aliases.indexOf(hostname))
    frags.splice(0, 0, hostname)
  var remote = remotes(frags[0])
  var user = frags[1].toLowerCase()
  if (remote.namespace === false && user !== '-') {
    var err = new Error('invalid username "' + user + '" for remote "' + remote.name + '"')
    err.status = 404
    throw err
  }
  return [
    remote,
    frags[1].toLowerCase(),
    frags[2].toLowerCase(),
    frags[3].toLowerCase(),
    frags.slice(4)
  ]
}

/**
 * /User/jong/repositories/github.com/component/emitter/1.0.0/index.js
 * to
 * https://github.nlz.io/component/emitter/1.0.0/index.js
 *
 * @param {String} uri
 * @return {String}
 * @api public
 */

exports.localToRemote = function (uri) {
  return exports.remote(exports.parseLocal(uri))
}

/**
 * https://github.nlz.io/component/emitter/1.0.0/index.js
 * to
 * /User/jong/repositories/github.com/component/emitter/1.0.0/index.js
 *
 * @param {String} uri
 * @return {String}
 * @api public
 */

exports.remoteToLocal = function (uri) {
  return exports.local(exports.parseRemote(uri))
}

/**
 * Get /User/jong/repositories/github.com/component/emitter/1.0.0/index.js
 * or something.
 *
 * @param {Object|Array} remote
 * @param {String} owner
 * @param {String} repo
 * @param {String} version
 * @return {String}
 * @api public
 */

exports.local = function (remote, owner, repo, version, tail) {
  if (Array.isArray(remote)) {
    owner = remote[1]
    repo = remote[2]
    version = remote[3]
    tail = remote[4]
    remote = remote[0]
  }

  return config.store
    + remote.name
    + '/' + owner
    + '/' + repo
    + '/' + (version || '')
    + rest(tail)
}

/**
 * Get https://github.com/component/emitter/1.0.0/index.js
 * or something.
 *
 * @param {Object|Array} remote
 * @param {String} owner
 * @param {String} repo
 * @param {String} version
 * @return {String}
 * @api public
 */

exports.remote = function (remote, owner, repo, version, tail) {
  if (Array.isArray(remote)) {
    owner = remote[1]
    repo = remote[2]
    version = remote[3]
    tail = remote[4]
    remote = remote[0]
  }

  return 'https://'
    + config.hostname
    + '/' + remote.name
    + '/' + owner
    + '/' + repo
    + '/' + (version || '')
    + rest(tail)
}

/**
 * Convert a rest string or array into an appropriate URL tail.
 *
 * @param {Array|String} rest
 * @return {String} tail
 * @api private
 */

function rest(params) {
  if (Array.isArray(params)) params = params.join('/')
  if (!params) return ''
  if (params[0] !== '/') params = '/' + params
  return params
}
