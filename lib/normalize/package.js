
var fs = require('co-fs')
var isModule = require('is-module')
var append = require('fs').appendFile

var fs = require('co-fs')
var semver = require('semver')
var isModule = require('is-module')
var append = require('fs').appendFile
var parseGH = require('parse-github-repo-url')
var debug = require('debug')('normalize-proxy:normalize:package')

var utils = require('../utils')
var commonjs = require('./common')

var stripRelative = utils.stripRelative
var trailingSlash = utils.ensureTrailingSlash


/**
 * Normalize a package with a `package.json`.
 *
 * - gets `main` from `.browser.main` then `.main`
 * - does not resolve CSS for npm yet
 */

module.exports = Package

function Package(path) {
  if (!(this instanceof Package)) return new Package(path)
  this.path = trailingSlash(path)
  return this.end()
}

Package.prototype.end = function* () {
  debug('normalizing: %s', this.path)
  yield* this.getJSON()
  if (!this.json) return debug('package at %s not found', this.path)
  this.getDependencies()
  debug('rewriting JS entrypoint of: %s', this.path)
  yield* this.rewriteJS()
  debug('rewriting dependencies of: %s', this.path)
  yield* commonjs(this.path + 'index.js', this.dependencies)
  debug('finished normalizing: %s', this.path)
}

/**
 * Log any errors and such to `/normalize-debug.log`.
 */

Package.prototype.log = function (type, message) {
  if (type instanceof Error) {
    type.stack.split('\n').forEach(function (line) {
      this.log('error', line)
    }, this)
    return
  }

  append(this.path + 'normalize-debug.log',
   'normalize:package:' + type + ': ' + message + '\n',
   noop)
}

Package.prototype.getJSON = function* () {
  try {
    this.json = JSON.parse(yield fs.readFile(this.path + 'package.json', 'utf8'))
  } catch (_) {
    this.log('error', 'invalid package.json, aborting normalization')
  }
}

/**
 * Create a `.dependencies object to look up all this components' dependencies.
 * To do: what about components not on GitHub? Are there any?
 */

Package.prototype.getDependencies = function () {
  var dependencies = this.dependencies = Object.create(null)
  var deps = this.json.dependencies
  if (!deps) return this.repos = []
  var repos = this.repos = []
  Object.keys(deps).forEach(function (name) {
    var version = deps[name]
    var repo
    var gh
    if (semver.validRange(version)) {
      // maybe make loose?
      repo = 'https://nlz.io/npm/-/' + name + '/' + version
    } else if (gh = parseGH(version)) {
      // github dependencies
      repo = 'https://nlz.io/github/' + gh[0] + '/' + gh[1] + '/' + (version || '*')
    } else {
      // everything else is *
      this.log('could not resolve dependency ' + name + '@"' + version + '". resolving to *')
      repo = 'https://nlz.io/npm/-/' + name + '/*'
    }
    repos.push(repo)
    dependencies[name] = repo
  }, this)
}

Package.prototype.rewriteJS = function* () {
  var json = this.json
  // WAHT THE FUCK
  var main = 'index.js'
  if (typeof json.browser === 'object') main = json.browser.main
  else if (typeof json.browser === 'string') main = json.browser
  else if (json.main) main = json.main
  main = stripRelative(main)

  if (!/\.js$/.test(main)) {
    this.log('error', 'non-js file main, aborting normalization')
    return
  }

  if (!(yield fs.exists(this.path + main))) {
    this.log('info', 'JS entry point "' + main + '" not found. skipping js normalization')
    return
  }

  if (main === 'index.js') return

  var string
  try {
    string = yield fs.readFile(this.path + main, 'utf8')
  } catch (err) {
    this.log('error', 'could not read ' + main + ', aborting normalization')
    this.log('error', err.stack)
    return
  }

  debug('proxying %s to %s', main, 'index.js')
  this.log('info', 'normalizing ' + main + ' to index.js. the current index.js file, if present, will be overwritten')

  yield fs.writeFile(this.path + 'index.js', isModule(string)
    ? 'export * from "./' + main + '";'
    : 'module.exports = require("./' + main + '")')
}

function noop() {}
