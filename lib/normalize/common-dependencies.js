
/**
 * Get the dependencies and repositories of a package
 * based on various `.json` manifest files.
 */

var fs = require('mz/fs')
var path = require('path')
var semver = require('semver')
var inspect = require('util').inspect
var parseGH = require('parse-github-repo-url')
var debug = require('debug')('normalize-proxy:normalize:common-dependencies')

var log = require('./log')('common-dependencies')

module.exports = Dependencies

function Dependencies(root) {
  if (!(this instanceof Dependencies)) return new Dependencies(root)

  this.root = root
  // lookup an arbitrary dependency by name
  this.dependencies = {}
  // repositories per type of .json file
  this.repositories = {}
  return this.end()
}

Dependencies.prototype.end = function* () {
  // in order of ascending importance
  yield* this.package()
  yield* this.component()
  debug('got dependencies: %s', inspect(this.dependencies))
  debug('got repositories: %s', inspect(this.repositories))

  return this
}

Dependencies.prototype.json = function* (name) {
  var filename = path.join(this.root, name)
  try {
    return JSON.parse(yield fs.readFile(filename, 'utf8'))
  } catch (err) {}
}

Dependencies.prototype.package = function* () {
  var json = yield* this.json('package.json')
  if (!json) return
  var repos = this.repositories.package = []
  var deps = json.dependencies
  if (!deps) return

  var dependencies = this.dependencies

  // lookup dependencies
  Object.keys(deps).forEach(function (name) {
    var version = deps[name]
    var repo
    var gh

    if (semver.valid(version, true) || semver.validRange(version)) {
      // maybe make loose?
      repo = 'https://nlz.io/npm/-/' + name + '/' + version
    } else if (gh = parseGH(version)) {
      // github dependencies
      repo = 'https://nlz.io/github/' + gh[0] + '/' + gh[1] + '/' + (gh[2] || '*')
    } else {
      // everything else is *
      log(this.root + 'normalize-debug.log', 'error',
        'could not resolve dependency ' + name + '@"' + version + '". resolving to *')
      repo = 'https://nlz.io/npm/-/' + name + '/*'
    }

    repos.push(repo)
    dependencies[name] = repo
  }, this)

  // lookup browser aliases, which we also attach to dependencies
  var browser = json.browser
  if (typeof browser !== 'object') browser = {}
  var root = this.root

  Object.keys(browser).forEach(function (key) {
    var value = browser[key]

    // relative file
    if (key[0] === '.') {
      dependencies[path.resolve(root, sanitizeRelative(key))] = value[0] === '.'
        ? path.resolve(root, sanitizeRelative(value)) // relative file
        : dependencies[value] // module
      return
    }

    // module
    if (value === false) return dependencies[key] = false // i'm not sure what to do here
    if (value[0] === '.') return dependencies[key] = path.resolve(root, sanitizeRelative(value))
    dependencies[key] = dependencies[value]
  })
}

Dependencies.prototype.component = function* () {
  var json = yield* this.json('component.json')
  if (!json) return
  var repos = this.repositories.component = []
  var deps = json.dependencies
  if (!deps) return

  var dependencies = this.dependencies

  Object.keys(deps).forEach(function (name) {
    var version = deps[name]
    // it's always github, so it should never fail
    name = name.toLowerCase()
    var repo = 'https://nlz.io/github/' + name + '/' + (version || '*')
    repos.push(repo)
    // allow looking up via `-`
    dependencies[name] =
    dependencies[removeJS(name)] =
    dependencies[name.replace('/', '-')] =
    dependencies[name.replace('/', '~')] = repo
    // looking up by name
    var name = name.split('/')[1]
    if (name) {
      // not sure why this would ever not work but whatever
      dependencies[name] =
      dependencies[removeJS(name)] = repo
    }
    // by component.json name
    dependencies[json.name] = repo
  })
}

function removeJS(str) {
  return str.replace(/\.js$/, '')
}

function sanitizeRelative(target) {
  if (target[0] !== '.') target = './' + target
  if (!/\.js$/.test(target)) target += '.js'
  return target
}
