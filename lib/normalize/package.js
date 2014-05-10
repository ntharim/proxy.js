
var fs = require('mz/fs')
var semver = require('semver')
var isModule = require('is-module')
var inspect = require('util').inspect
var resolve = require('path').resolve
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
 * - gets `main` from `.browser` then `.main`
 * - does not resolve CSS for npm yet
 *
 * See: https://gist.github.com/defunctzombie/4339901
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
  this.rewriteDependencies()
  debug('rewriting JS entrypoint of: %s', this.path)
  yield* this.rewriteJS()
  debug('rewriting CSS entrypoint of: %s', this.path)
  yield* this.rewriteCSS()
  debug('rewriting dependencies of: %s', this.path)
  yield* commonjs(this.path + 'index.js', this.dependencies, this.aliases)
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
    if (semver.valid(version, true) && semver.validRange(version)) {
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
  if (typeof json.browser === 'string') main = json.browser
  else if (json.main) main = json.main
  main = stripRelative(main)

  if (!(yield fs.exists(this.path + main))) {
    this.log('info', 'JS entry point "' + main + '" not found. skipping js normalization')
    return
  }

  if (main === 'index.js') return

  if (!/\.js$/.test(main)) {
    // eventually, this should be ES6
    this.log('info', 'non-js file main, proxying to "' + main + '.js"')
    yield fs.writeFile(this.path + 'index.js',
      'module.exports = require("./' + main + '.js")')
    return
  }

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

/**
 * Rewrite files in the `.browser` field
 */

Package.prototype.rewriteDependencies = function () {
  var browser = this.json.browser
  if (typeof browser !== 'object') return this.aliases = {}

  var path = this.path
  var aliases = this.aliases = {}
  var dependencies = this.dependencies
  Object.keys(browser).forEach(function (key) {
    var value = browser[key]
    if (key[0] === '.') {
      // relative file
      aliases[resolve(path, sanitizeRelative(key))] = resolve(path, sanitizeRelative(value))
    } else {
      // module
      if (value === false) return delete dependencies[key]
      if (value[0] === '.') return dependencies[key] = resolve(path, sanitizeRelative(value))
      dependencies[key] = dependencies[value]
    }
  })

  debug('rewritten dependencies: %s', inspect(dependencies))
  debug('aliases: %s', inspect(aliases))
}

Package.prototype.rewriteCSS = function* () {
  var style = this.json.style
  if (!style) return this.log('info', 'no css file found')
  if (!/^\.\//.test(style)) style = './' + style
  if (!/\.css/.test(style)) return this.log('error', 'style file not .css, ignoring')
  if (style === './index.css') return

  this.log('info', 'automatically creating an index.css point')
  debug('creating index.css at %s', this.path + 'index.css')
  yield fs.writeFile(this.path + 'index.css', '\n@import "' + style + '";\n\n')
}

function sanitizeRelative(target) {
  if (target[0] !== '.') target = './' + target
  if (!/\.js$/.test(target)) target += '.js'
  return target
}

function noop() {}
