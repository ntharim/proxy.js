
var fs = require('co-fs')
var path = require('path')
var inspect = require('util').inspect
var Walker = require('normalize-walker')
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

function* walk(entrypoint, dependencies) {
  var walker = Walker()
  var overwriter = overwrite(dependencies)
  debug('resolving %s\'s dependencies against %s', entrypoint, inspect(dependencies))

  // see custom ../walker.js' add() method
  var dependency = new Walker.dependency(entrypoint)
  dependency.remoteURI = uris.localToRemote(entrypoint)
  walker.dependencies[entrypoint] = dependency

  walker.use(plugins.overwrite.save())
  walker.use(Walker.plugins.logs())
  walker.use(plugins.resolve())
  // this is where all the main rewriting logic is!
  walker.use(plugins.overwrite.js(overwriter))
  walker.use(Walker.plugins.js())
  walker.use(Walker.plugins.file())
  walker.use(Walker.plugins.absolute())
  walker.use(plugins.rewrite.js())
  yield* walker.tree() // we don't actually care about the output
  debug('resolved %s\'s dependencies', entrypoint)
}

function overwrite(dependencies) {
  return function* (filename, path) {
    // already a full URI
    if (~path.indexOf('://') || path[0] === '/') return

    if (/^\.\//.test(path)) {
      // relative dependency
      // note that commonjs relative dependencies need ./,
      // whereas CSS dependencies do not
      var folder = dirname(filename)
      for (var i = 0; i < extensions.length; i++) {
        var target = resolve(folder, path + extensions[i])
        if (yield fs.exists(target)) {
          target = relative(folder, target)
          if (target[0] !== '.') target = './' + target
          return target
        }
      }
    } else {
      var frags = path.split('/')
      path = frags[0]
      // support stuff like `require('module/something')`
      var tail = frags.slice(1).join('/')
      if (tail) {
        tail = '/' + tail
        // always append `.js` to files
        // however, this has a chance of failure!
        if (!/\.js$/.test(tail)) tail += '.js'
      }
      if (dependencies[path])
        return dependencies[path] + (tail || '/index.js')
      // mostly because of npm case sensitivity goodness
      if (dependencies[path.toLowerCase()])
        return dependencies[path.toLowerCase()] + (tail || '/index.js')
      if (builtins[path])
        return builtins[path]
    }
  }
}
