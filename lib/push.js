
var fs = require('fs')
var zlib = require('zlib')
var mime = require('mime')

var utils = require('./utils')

var remotePath = utils.localToRemotePath

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

module.exports = function (file) {
  var onerror = this.onerror

  var type = mime.lookup(file.basename)
  var charset = mime.charsets.lookup(file.basename)
  if (charset) type += '; charset=' + charset.toLowerCase()

  var headers = {
    etag: '"' + file.hash + '"',
    'last-modified': file.mtime.toUTCString(),
    'content-type': type,
    'content-encoding': 'gzip',
  }

  var stream = this.res.push(remotePath(file.uri), headers)
  stream.on('error', onerror)
  stream.on('acknowledge', function () {
    if (file.string) {
      zlib.gzip(file.string, function (err, string) {
        if (err) return onerror(err)
        stream.end(string)
      })
      return
    }

    var body = fs.createReadStream(file.uri)
      .on('error', onerror)

    body.pipe(zlib.createGzip())
      .on('error', onerror)
      .pipe(this)

    // the client is going to cancel these streams pretty frequently,
    // so we want to make sure we don't leak any file descriptors
    var destroy = body.destroy.bind(body)
    stream.once('error', destroy)
    stream.once('close', destroy)
    stream.once('finished', destroy)
  })
}
