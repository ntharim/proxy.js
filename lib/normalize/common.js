
var fs = require('co-fs')
var path = require('path')
var inspect = require('util').inspect
var Walker = require('normalize-walker')
var deps = require('normalize-dependencies').js
var Dependency = require('normalize-walker/lib/dependency')
var debug = require('debug')('normalize-proxy:normalize:common')

var builtins = require('./node-modules')
var plugins = require('../plugins')
var uris = require('../uri')

var resolve = path.resolve
var dirname = path.dirname
var relative = path.relative

module.exports = walk

/**
 * Normalize the require()s and imports of JS files,
 * specifically component and browserify files.
 * Allow custom `require()` to `repo` mappings based
 * on a `dependencies` object since they do package management differently.
 */

// extensions to look up
var extensions = [
  '',
  '.js',
  '.json',
  '/index.js',
]

function* walk(entrypoint, dependencies, aliases) {
  if (!(yield fs.exists(entrypoint))) return

  aliases = aliases || {}
  var walker = Walker()
  debug('resolving %s\'s dependencies against %s with aliases %s', entrypoint, inspect(dependencies), inspect(aliases))

  // see custom ../walker.js' add() method
  var dependency = new Dependency(entrypoint)
  dependency.remote = uris.localToRemote(entrypoint)
  walker.dependencies[entrypoint] = dependency

  walker.use(plugins.overwrite.save())
  walker.use(Walker.plugins.logs())
  walker.use(Walker.plugins.text())
  walker.use(Walker.plugins.json())
  walker.use(rewrite)
  yield* walker.tree() // we don't actually care about the output
  debug('resolved %s\'s dependencies', entrypoint)

  function* rewrite(next) {
    if (!this.is('js')) return yield* next

    var file = this.setFile()
    yield* file.setSource(this.uri)
    file.dependencies = {}
    var string = yield* file.getString()

    var map = Object.create(null)
    var matches = deps.match(string)
    for (var i = 0; i < matches.length; i++) {
      var match = matches[i]
      var name = match.path
      var newname = yield* overwrite(file.uri, name)

      if (!newname) {
        file.log('normalize:common:info', 'could not resolve dependency "' + name + '", ignoring')
        continue
      }

      debug('renaming %s\'s dependency %s to %s', file.uri, name, newname)

      // relative dependencies
      if (/^\.\//.test(newname)) {
        // must always have .js extensions unlike commonjs
        // ex. .json -> .json.js, .html -> .html.js
        if (!/\.js/.test(newname)) newname += '.js'
        // we only want to resolve relative dependencies,
        // not the remote dependencies.
        // we always keep it as ./ and let the real walker do the work.
        file.push(newname, file.resolve(newname), {
          method: match.type
        })

        // don't need to overwrite unnecessarily
        if (name === newname) continue
      }

      file.log('normalize:common:info', 'rewriting dependency "' + name + '" to "' + newname + '"')
      map[name] = newname
    }

    if (Object.keys(map).length) {
      debug('renaming dependencies: %s', inspect(map))
      file.string = deps.replace(string, map)
      file.overwrite = true
    }
    yield* next
  }

  function* overwrite(filename, path) {
    // already a full URI, though this shouldn't happen
    if (~path.indexOf('://') || path[0] === '/') return

    var folder = dirname(filename)

    if (/^\.\//.test(path)) {
      // check aliases
      var target = aliases[resolve(folder, sanitizeRelative(path))]
      if (target) {
        if (!(yield fs.exists(target))) return false
        return sanitizeRelative(relative(folder, target))
      }

      // relative dependency
      // note that commonjs relative dependencies need ./,
      // whereas CSS dependencies do not
      for (var i = 0; i < extensions.length; i++) {
        target = resolve(folder, path + extensions[i])
        if (yield fs.exists(target))
          return sanitizeRelative(path + extensions[i])
      }
    } else {
      // support stuff like `require('module/something')`
      var frags = path.split('/')
      path = frags[0]
      var tail = frags.slice(1).join('/')
      if (tail) {
        tail = '/' + tail
        // always append `.js` to files
        // however, this has a chance of failure!
        if (!/\.js$/.test(tail)) tail += '.js'
      }

      // lookup dependencies
      var target = dependencies[path]
        || dependencies[path.toLowerCase()]
      if (target) {
        if (target[0] === '.') {
          if (!(yield fs.exists(target))) return false
          return sanitizeRelative(relative(folder, target))
        } else {
          return target + (tail || '/index.js')
        }
      }

      // lookup node modules
      if (builtins[path]) return builtins[path]
    }
  }
}

function sanitizeRelative(target) {
  if (target[0] !== '.') target = './' + target
  if (!/\.js$/.test(target)) target += '.js'
  return target
}
