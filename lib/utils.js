

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
 * Replace a string with another string within comments.
 * Note: this should be replaced by better implementations on a per-type basis.
 *
 * @param {String} text
 * @param {String} match
 * @param {String} replace
 * @return {String}
 * @api private
 */

exports.replaceStrings = function (text, match, replace) {
  var re = new RegExp('[\'"]' + escapeRegExp(match) + '[\'"]', 'g')
  return text.replace(re, '"' + replace + '"')
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

/**
 * Escape regexp special characters in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

function escapeRegExp(str){
  return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1')
}
