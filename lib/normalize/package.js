
var fs = require('mz/fs')
var isModule = require('is-module')
var debug = require('debug')('normalize-proxy:normalize:package')

var log = require('./log')('package')
var utils = require('../utils')
var commonjs = require('./common')
var Dependencies = require('./common-dependencies')

var thunkify = require('thunkify')
var glob = thunkify(require('glob'))

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
  this.dependencies = yield* Dependencies(this.path)
  debug('rewriting JS entrypoint of: %s', this.path)
  yield* this.rewriteJS()
  debug('rewriting CSS entrypoint of: %s', this.path)
  yield* this.rewriteCSS()
  debug('rewriting dependencies of: %s', this.path)
  var files = yield glob('**/*.js', { cwd: this.path })
  for (var i = 0, l = files.length; i < l; i++) {
    var file = files[i]
    yield* commonjs(this.path + file, this.dependencies.dependencies)
  }
  debug('finished normalizing: %s', this.path)
}

/**
 * Log any errors and such to `/normalize-debug.log`.
 */

Package.prototype.log = function (type, message) {
  log(this.path + 'normalize-debug.log', type, message)
}

Package.prototype.getJSON = function* () {
  try {
    this.json = JSON.parse(yield fs.readFile(this.path + 'package.json', 'utf8'))
  } catch (_) {
    this.log('error', 'invalid package.json, aborting normalization')
  }
}

Package.prototype.rewriteJS = function* () {
  var json = this.json
  // WAHT THE FUCK
  var main = 'index.js'
  if (typeof json.browser === 'string') main = json.browser
  else if (json.main) main = json.main
  main = stripRelative(main)

  if (!/\.js$/.test(main)) main += '.js'

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
