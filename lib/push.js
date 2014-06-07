
var url = require('url')
var setType = require('set-type')
var push = require('koa-spdy-push')()
var extname = require('path').extname
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

module.exports = function (file, search, priority) {
  search = search || ''
  if (file.exists === false) return
  if (typeof priority !== 'number') priority = prioritize(file)

  var source = search === '?source'
  var path = url.parse(this.uri.localToRemote(source
    ? file.source
    : file.uri)).pathname + search
  var headers = {
    'access-control-allow-methods': 'HEAD,GET,OPTIONS',
    'access-control-allow-origin': '*',
    etag: '"' + file.hash + '"',
    'last-modified': file.mtime.toUTCString(),
    'cache-control': cacheControl,
    'content-type': setType(source
      ? extname(file.source)
      : file.basename),
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'deny',
    'x-xss-protection': '1; mode=block',
  }

  debug('pushing: %s', path)

  var body
  var filename
  if (search === '?source') {
    filename = file.source
  } else if (search === '?minified' && file.is('js', 'css')) {
    body = file.minified
  } else if ('string' in file) {
    body = file.string
  } else {
    filename = file.source
  }

  return push(this, {
    path: path,
    headers: headers,
    priority: priority,
    body: body,
    filename: filename,
  })
}

function prioritize(file) {
  switch (file.is('html', 'css', 'js')) {
  case 'html':
    return 3
  case 'css':
    return 4
  case 'js':
    return 5
  }
  // media always have lowest priority
  if (file.is('image/*', 'video/*')) return 7
  // default priority
  return 6
}
