
var url = require('url')
var setType = require('set-type')
var push = require('koa-spdy-push')()
var basename = require('path').basename
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

module.exports = function (file, source, priority) {
  if (typeof priority !== 'number') priority = prioritize(file)

  var path = url.parse(this.uri.localToRemote(source ? file.source : file.uri)).pathname
  var headers = {
    'access-control-allow-methods': 'HEAD,GET,OPTIONS',
    'access-control-allow-origin': '*',
    etag: '"' + file.hash + '"',
    'last-modified': file.mtime.toUTCString(),
    'cache-control': cacheControl,
    'content-type': setType(source ? basename(file.source) : file.basename),
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'deny',
    'x-xss-protection': '1; mode=block',
  }

  debug('pushing: %s', path)

  var filename
  if (source) {
    if (file.source === file.uri && 'string' in file) filename = false
    else filename = file.source
  } else {
    if ('string' in file) filename = false
    else filename = file.uri
  }

  push(this, {
    path: path,
    headers: headers,
    priority: priority,
    body: !filename && file.string,
    filename: filename
  })
}

function prioritize(file) {
  switch (file.is('html', 'css', 'js')) {
  case 'html': return 1
  case 'css': return 2
  case 'js': return 3
  }
  // media always have lowest priority
  if (file.is('image/*', 'video/*')) return 7
  // default priority
  return 5
}
