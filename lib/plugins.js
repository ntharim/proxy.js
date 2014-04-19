
var debug = require('debug')('normalize-proxy:plugins')
var deps = require('normalize-dependencies')
var path = require('path')

var resolve = require('./resolve')
var uris = require('./uri')

/**
 * Resolved the semver dependencies and
 * makes sure that the dependency is installed.
 */

exports.resolveDependency = function () {
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

/**
 * Rewrite @import and url()s to the appropriate URL.
 * To do: do proper @import and url() rewriting
 */

exports.rewriteCSSDependencies = function () {
  return function* rewriteCSSDependencies(next) {
    if (!this.is('css')) return yield* next

    var file = this.file
    var dependencies = file.dependencies
    var string = yield* file.getString()

    debug('%s has dependencies: %s', this.uri, Object.keys(dependencies).join(', '))

    var map = Object.create(null)
    Object.keys(dependencies).forEach(function (name) {
      var uri = validate.call(this, dependencies[name])
      if (uri) map[name] = uri
    }, this)
    file.string = deps.css.replace(string, map)

    yield* next
  }
}

/**
 * Rewrite imports and require()s to the appropriate URL.
 * To do: do proper import and require() rewriting
 */

exports.rewriteJSDependencies = function () {
  return function* rewriteJSDependencies(next) {
    if (!this.is('js')) return yield* next

    var file = this.file
    var dependencies = file.dependencies
    var string = yield* file.getString()

    debug('%s has dependencies: %s', this.uri, Object.keys(dependencies).join(', '))

    var map = Object.create(null)
    Object.keys(dependencies).forEach(function (name) {
      var uri = validate.call(this, dependencies[name])
      if (uri) map[name] = uri
    }, this)
    file.string = deps.js.replace(string, map)

    yield* next
  }
}

/**
 * Rewrite src="" and href="" tags.
 * To do: all of it.
 */

exports.rewriteHTMLDependencies = function () {
  return function* rewriteHTMLDependencies(next) {
    if (!this.is('html')) return yield* next

    yield* next
  }
}

/**
 * Make sure the dependency URI is allowed,
 * then resolve relative URIs to absolute URIs.
 * In the future, we should just keep the relative URIs.
 */

function validate(dependency) {
  var uri = dependency.uri
  debug('validating dependency URI: %s', uri)
  if (uri.slice(0, 2) === '//') {
    debug('ignoring URI with //: %s', uri)
    return false
  }
  if (~uri.indexOf('://') && uri.indexOf('https://')) {
    debug('ignoring URI without https://: %s', uri)
    return false
  }
  // normalize remote dependencies
  if (!uri.indexOf('https://'))
    return dependency.remoteURI = normalize(uri)
  // rewrite local dependencies
  debug('rewriting dependency %s -> %s', this.uri, uri)
  uri = dependency.uri = path.resolve(path.dirname(this.uri), uri)
  debug('to %s', uri)
  return dependency.remoteURI = uris.localToRemote(uri)
}

/**
 * Normalize an absolute URI by looking up remotes.
 * Ignores any unsupported URIs.
 *
 * @param {String} uri
 * @return {String} uri
 * @api private
 */

function normalize(uri) {
  var res
  try {
    res = uris.parseRemote(uri)
  } catch (err) {
    if (err.status = 404) {
      debug('could not resolve remote, ignoring: %s', uri)
      return uri
    }
    throw err
  }
  return uris.remote(res)
}

function* noop() {/* jshint noyield:true */}
