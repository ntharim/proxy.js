
var shorthand = require('normalize-shorthands')(require('../remotes'))
var debug = require('debug')('normalize-proxy:plugins:rewrite')
var deps = require('normalize-dependencies')
var path = require('path')

var uris = require('../uri')


/**
 * Rewrite @import and url()s to the appropriate URL.
 * To do: do proper @import and url() rewriting
 */

exports.css = function () {
  return function* rewriteCSSDependencies(next) {
    yield* next

    if (!this.is('css')) return

    var file = this.file
    var dependencies = file.dependencies
    var string = yield* file.getString()

    debug('%s has dependencies: %s', this.uri, Object.keys(dependencies).join(', '))

    var map = Object.create(null)
    Object.keys(dependencies).forEach(function (name) {
      var uri = validate.call(this, dependencies[name], 'css')
      if (uri) {
        map[name] = uri
        file.log('rewrite:info', 'rewriting dependency "' + name + '" to "' + uri + '"')
      } else {
        delete dependencies[name]
      }
    }, this)
    file.string = deps.css.replace(string, map)
  }
}

/**
 * Rewrite imports and require()s to the appropriate URL.
 * To do: do proper import and require() rewriting
 */

exports.js = function () {
  return function* rewriteJSDependencies(next) {
    yield* next

    if (!this.is('js')) return

    var file = this.file
    var dependencies = file.dependencies
    var string = yield* file.getString()

    // opt out of rewriting when the JS file has its own require implementation.
    // see mocha
    if (/\bfunction\s+require\s*\(/.test(string)) {
      file.log('rewrite:info', 'function require(){} detecting, opting out of JS rewriting')
      file.dependencies = {}
      return
    }

    debug('%s has dependencies: %s', this.uri, Object.keys(dependencies).join(', '))

    var map = Object.create(null)
    Object.keys(dependencies).forEach(function (name) {
      var uri = validate.call(this, dependencies[name], 'js')
      if (uri) {
        map[name] = uri
        file.log('rewrite:info', 'rewriting dependency "' + name + '" to "' + uri + '"')
      } else {
        delete dependencies[name]
      }
    }, this)
    file.string = deps.js.replace(string, map)
  }
}

/**
 * Rewrite src="" and href="" tags.
 * To do: all of it.
 */

exports.html = function () {
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

function validate(dependency, ext) {
  var uri = dependency.uri
  debug('validating dependency URI: %s', uri)
  if (uri.slice(0, 2) === '//') {
    debug('ignoring URI starting with //: %s', uri)
    return false
  }
  if (~uri.indexOf('://') && uri.indexOf('https://')) {
    debug('ignoring remote URI without https://: %s', uri)
    return false
  }

  uri = shorthand(uri, ext) || uri
  uri = expand(uri, ext) || uri

  // normalize remote dependencies
  if (!uri.indexOf('https://')) {
    uri = normalize(uri)
    if (!uri) return false
    return dependency.remote = expand(uri, ext) || uri
  }

  // rewrite local dependencies
  debug('rewriting dependency %s -> %s', this.uri, uri)
  uri = dependency.uri = path.resolve(path.dirname(this.uri), uri)
  debug('to %s', uri)
  return dependency.remote = uris.localToRemote(uri)
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
    if (err.status === 404) {
      debug('could not resolve remote, ignoring: %s', uri)
      return false
    }
    throw err
  }
  return uris.remote(res)
}

function expand(uri, ext) {
  switch (ext) {
  case 'js':
    if (/\/$/.test(uri)) return uri + 'index.js'
    if (!/\.js$/.test(uri)) return uri + '.js'
  }
}
