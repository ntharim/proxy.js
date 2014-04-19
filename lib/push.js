
var fs = require('fs')
var url = require('url')
var zlib = require('zlib')
var mime = require('mime')
var inspect = require('util').inspect
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
  // 7 is lowest priority, 0 is highest.
  // http://www.chromium.org/spdy/spdy-protocol/spdy-protocol-draft3#TOC-2.3.3-Stream-priority
  if (typeof priority !== 'number') priority = 7
  var res = this.res
  var socket = this.socket
  var onerror = this.onerror

  var type = mime.lookup(file.basename)
  var charset = mime.charsets.lookup(file.basename)
  if (charset) type += '; charset=' + charset.toLowerCase()

  var headers = {
    etag: '"' + file.hash + '"',
    'last-modified': file.mtime.toUTCString(),
    'cache-control': cacheControl,
    'content-type': type,
    'content-encoding': 'gzip',
  }

  var path = url.parse(this.uri.localToRemote(file.uri)).pathname
  debug('pushing: %s with headers %s', path, inspect(headers))
  var stream = res.push(path, headers, priority)
  stream.on('error', cleanup)
  stream.on('acknowledge', acknowledge)
  stream.on('close', cleanup)
  socket.on('close', cleanup)

  function acknowledge() {
    cleanup()

    if (file.string) {
      zlib.gzip(file.string, function (err, string) {
        if (err) return onerror(err)
        stream.end(string)
      })
      return
    }

    var body = fs.createReadStream(file.uri)
      .on('error', destroy)

    body.pipe(zlib.createGzip())
      .on('error', destroy)
      .pipe(this)

    // the client is going to cancel these streams pretty frequently,
    // so we want to make sure we don't leak any file descriptors
    stream.once('error', destroy)
    stream.once('close', destroy)
    stream.once('finish', destroy)
    socket.once('close', destroy)

    function destroy(err) {
      onerror(err)
      body.destroy()

      stream.removeListener('error', destroy)
      stream.removeListener('finish', destroy)
      stream.removeListener('close', destroy)
      socket.removeListener('close', destroy)
    }
  }

  // getting "write after end" if the client prematurely closes
  function cleanup(err) {
    // ignore rst streams, which are client `stream.destroy()`s
    if (err && !err.message.indexOf('Received rst:')) onerror(err)

    stream.removeListener('acknowledge', acknowledge)
    stream.removeListener('close', cleanup)
    socket.removeListener('close', cleanup)
  }
}
