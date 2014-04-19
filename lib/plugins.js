
var debug = require('debug')('normalize-proxy:plugins')
var path = require('path')

var replace = require('./utils').replaceStrings
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

    Object.keys(dependencies).forEach(function (name) {
      var uri = validate.call(this, dependencies[name])
      string = replace(string, name, uri)
    }, this)

    file.string = string

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

    Object.keys(dependencies).forEach(function (name) {
      var uri = validate.call(this, dependencies[name])
      string = replace(string, name, uri)
    }, this)

    file.string = string

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
  if (uri.slice(0, 2) === '//')
    throw new Error('URLs must not be protocol-less: ' + uri)
  // if (uri[0] === '/')
    // throw new Error('URLs must not be absolute: ' + uri)
  if (~uri.indexOf('://')) {
    if (uri.indexOf('https://'))
      throw new Error('URLs must use https://: ' + uri)
    // let the actual resolver handle it,
    // but otherwise it's a good URI.
    return dependency.remoteURI = uri
  }

  // local dependency path resolution
  debug('resolve %s and %s', this.uri, uri)
  uri = dependency.uri = path.resolve(this.uri, '..', uri)
  debug('got %s', uri)
  // full remote name
  return dependency.remoteURI = uris.localToRemote(uri)
}

function* noop() {/* jshint noyield:true */}
