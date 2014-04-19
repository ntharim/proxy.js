

var crypto = require('crypto')

/**
 * Remove leading ='s and v's in versions
 * because they are annoying.
 *
 * @param {String} version
 * @return {String} version
 * @api private
 */

exports.strictVersion = function (version) {
  var first = version[0]
  return first === 'v' || first === '='
    ? version.slice(1)
    : version
}

/**
 * Base64 sha256sum of a string.
 *
 * @param {String}
 * @return {String}
 * @api public
 */

exports.shasum = function (string) {
  return crypto.createHash('sha256').update(string).digest('base64')
}
