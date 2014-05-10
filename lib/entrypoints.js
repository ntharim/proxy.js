
var exists = require('mz/fs').exists

var entrypoints = [
  'index.html',
  'index.css',
  'index.js',
]

/**
 * Return the supported entry points of a package.
 *
 * @param {String} path
 * @return {Boolean}
 * @api public
 */

exports = module.exports = function* (path) {
  if (path.slice(-1) !== '/') path += '/'
  var out = []
  yield entrypoints.map(function (file) {
    return function* () {
      if (yield* exports.has(path, file)) out.push(file)
    }
  })
  return out
}

/**
 * Check if a package has a specific entry point.
 *
 * @param {String} path
 * @param {String} file
 * @return {Boolean}
 * @api public
 */

exports.has = function* (path, file) {
  if (path.slice(-1) !== '/') path += '/'
  return yield exists(path + file)
}
