
var fs = require('co-fs')
var isModule = require('is-module')
var append = require('fs').appendFile
var debug = require('debug')('normalize-proxy:normalize:component')

var uris = require('../uri')
var utils = require('../utils')
var commonjs = require('./common')
var resolve = require('../resolve')
var entrypoints = require('../entrypoints')

var stripRelative = utils.stripRelative
var trailingSlash = utils.ensureTrailingSlash

/**
 * Normalize a package with a `component.json`.
 *
 * - Resolves JS dependencies 1) from the `component.json` 2) from `node-modules.js`,
 *   giving components browserify support as well!
 *
 * - Resolves CSS by normalizing the main file to `index.css` and prepending `@import` statements.
 *   It will throw if the user is doing stupid stuff because I'm lazy.
 */

module.exports = Component

function Component(path) {
  if (!(this instanceof Component)) return new Component(path)
  this.path = trailingSlash(path)
  return this.end()
}

Component.prototype.end = function* () {
  debug('normalizing: %s', this.path)
  yield* this.getJSON()
  if (!this.json) return debug('component at %s not found', this.path)
  this.getDependencies()
  debug('rewriting JS entrypoint of: %s', this.path)
  yield* this.rewriteJS()
  debug('rewriting CSS entrypoint of: %s', this.path)
  yield* this.rewriteCSS()
  debug('rewriting dependencies of: %s', this.path)
  yield* commonjs(this.path + 'index.js', this.dependencies)
  debug('finished normalizing: %s', this.path)
}

/**
 * Log any errors and such to `/normalize-debug.log`.
 */

Component.prototype.log = function (type, message) {
  if (type instanceof Error) {
    type.stack.split('\n').forEach(function (line) {
      this.log('error', line)
    }, this)
    return
  }

  append(this.path + 'normalize-debug.log',
   'normalize:component:' + type + ': ' + message + '\n',
   noop)
}

Component.prototype.getJSON = function* () {
  try {
    this.json = JSON.parse(yield fs.readFile(this.path + 'component.json', 'utf8'))
  } catch (_) {
    this.log('error', 'invalid component.json, aborting normalization')
  }
}

/**
 * Create a `.dependencies object to look up all this components' dependencies.
 * To do: what about components not on GitHub? Are there any?
 */

Component.prototype.getDependencies = function () {
  var dependencies = this.dependencies = Object.create(null)
  var deps = this.json.dependencies
  if (!deps) return this.repos = []
  var repos = this.repos = []
  Object.keys(deps).forEach(function (name) {
    var version = deps[name]
    name = name.toLowerCase()
    var repo = 'https://nlz.io/github/' + name + '/' + (version || '*')
    repos.push(repo)
    // allow looking up via `-`
    dependencies[name] =
    dependencies[name.replace('/', '-')] =
    dependencies[name.replace('/', '~')] = repo
    // looking up by name
    dependencies[name.split('/')[1]] = repo
    // by component.json name
    dependencies[this.json.name] = repo
  }, this)
}

/**
 * Get a list of only the CSS dependencies.
 * Called after .getDependencies().
 * Checks for the existence of `index.css` files
 */

Component.prototype.getCSSDependencies = function* () {
  var deps = yield this.repos.map(function (repo) {
    return function* () {
      var res = yield* resolve(repo)
      res = res.slice(0, 4) // don't want the tail
      if (yield* entrypoints.has(uris.local(res.slice(0, 4), 'index.css')))
        return repo + '/index.css'
    }
  })
  this.cssDependencies = deps.filter(Boolean)
}

/**
 * Make sure there's an index.js
 */

Component.prototype.rewriteJS = function* () {
  var scripts = this.json.scripts || []
  if (!scripts || !scripts.length) return this.log('info', 'no js files found')
  scripts = scripts.map(stripRelative)
  var main = stripRelative(this.json.main || 'index.js')
  if (main !== 'index.js') {
    // why would this happen???
    if (!/\.js$/.test(main)) return this.log('error', 'non-js file main, aborting normalization')
    if (~scripts.indexOf('index.js')) return this.log('error', 'index.js not main, aborting normalization')
    this.log('info', 'normalizing ' + main + ' to index.js. the current index.js file, if present, will be overwritten')
    var string
    try {
      string = yield fs.readFile(this.path + main, 'utf8')
    } catch (err) {
      this.log('error', 'could not read ' + main + ', aborting normalization')
      this.log('error', err.stack)
      return
    }
    // make sure the index.js file module loading mechanism matches the module's
    // note that we might face some issues with ES6 transpilers
    debug('proxing %s to %s', this.path + 'index.js', main)
    yield fs.writeFile(this.path + 'index.js', isModule(string)
      ? 'export * from "./' + main + '";'
      : 'module.exports = require("./' + main + '")')
  }
}

/**
 * Make sure there's an index.css
 */

Component.prototype.rewriteCSS = function* () {
  var styles = this.json.styles || []
  if (!styles || !styles.length) return this.log('info', 'no css files found')
  yield* this.getCSSDependencies()
  styles = styles.map(stripRelative)
  var deps = this.cssDependencies.length
    ? ('\n/* normalized component.json dependencies */\n'
      + this.cssDependencies.map(toImport).join('')
      + '\n/* end normalized component.json dependencies */\n\n')
    : ''
  if (styles.length === 1 && styles[0] === 'index.css') {
    if (!deps) return
    this.log('info', 'prepending dependencies to index.css')
    var string = yield fs.readFile(this.path + 'index.css', 'utf8')
    string = deps + string
    yield fs.writeFile(this.path + 'index.css', string)
    return
  }
  if (~styles.indexOf('index.css')) {
    this.log('error', 'multiple styles found, but one is index.css. normalization is aborted because this is too complicated!')
    this.log('error', 'please either use only a single index.css file or list of non-index.css files')
    return
  }
  this.log('info', 'automatically creating an index.css entry point for all the styles')
  debug('creating index.css at %s', this.path + 'index.css')
  yield fs.writeFile(this.path + 'index.css', deps
    + '\n/* normalized component.json styles */\n'
    + styles.map(toImport).join('')
    + '\n/* end normalized component.json styles */\n\n')
}

function toImport(uri) {
  return '@import "' + uri + '";\n'
}

function noop() {}
