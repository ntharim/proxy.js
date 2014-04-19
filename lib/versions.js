
var semver = require('semver')
var fs = require('fs')

/**
 * Return the versions installed at a `path`,
 * where the path looks like:
 *
 *   ../<hostname/<user>/<repo>
 *
 * Since versions are stored as nested directories
 *
 * @param {String} path
 * @return {Array} versions
 * @api public
 */

module.exports = function* (path) {
  return (yield readdir(path))
    .filter(notHidden)
    .sort(semver.rcompare)
}

function readdir(path) {
  return function (done) {
    fs.readdir(path, function (err, dirs) {
      done(null, dirs || [])
    })
  }
}

function notHidden(x) {
  return x[0] !== '.'
}
