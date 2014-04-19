
var fs = require('fs')

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
      if (yield exists(path + file)) out.push(file)
    }
  })
  return out
}

/**
 * Every package must have an entry point!
 *
 * @param {String} path
 * @return {Boolean}
 * @api public
 */

exports.invalidPackage = function* (path) {
  for (var i = 0; i < entrypoints.length; i++)
    if (yield exists(path + '/' + entrypoints[i]))
      return false
  return true
}

function exists(path) {
  return function (done) {
    fs.exists(path, done.bind(null, null))
  }
}
