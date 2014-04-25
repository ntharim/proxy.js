
var url = require('url')
var mime = require('mime-extended')
var push = require('koa-spdy-push')()
var debug = require('debug')('normalize-proxy:push')

var cacheControl = require('../config').cacheControl.file

/**
 * SPDY push a file. Should be used as a Koa function.
 * The request should be checked for `res.isSpdy` prior.
 *
 * To do:
 *   - content negotiation for encoding type
 *   - content-length when not streaming
 *
 * @context {this}
 * @param {file}
 * @api private
 */

module.exports = function (file, priority) {
  var type = mime.lookup(file.basename)
  var charset = mime.charsets.lookup(file.basename)
  if (charset) type += '; charset=' + charset.toLowerCase()

  var path = url.parse(this.uri.localToRemote(file.uri)).pathname
  var headers = {
    'access-control-allow-methods': 'HEAD,GET,OPTIONS',
    'access-control-allow-origin': '*',
    etag: '"' + file.hash + '"',
    'last-modified': file.mtime.toUTCString(),
    'cache-control': cacheControl,
    'content-type': type,
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'deny',
    'x-xss-protection': '1; mode=block',
  }

  debug('pushing: %s', path)

  push(this, {
    path: path,
    headers: headers,
    priority: priority,
    body: file.string,
    filename: !('string' in file) && file.uri
  })
}
