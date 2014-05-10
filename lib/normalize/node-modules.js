
/**
 * Equivalent to https://github.com/substack/node-browserify/blob/master/lib/builtins.js
 *
 * To do: specify versions from browserify's package.json
 */


var empty = 'https://nlz.io/github/normalize/empty/1/index.js'

exports.assert = 'assert'
exports.buffer = 'buffer'
exports.child_process = empty
exports.cluster = empty
exports.console = 'console-browserify'
exports.constants = 'constants-browserify'
exports.crypto = 'crypto-browserify'
exports.dgram = empty
exports.dns = empty
exports.domain = 'domain-browser'
exports.events = 'events'
exports.fs = empty
exports.http = 'http-browserify'
exports.https = 'https-browserify'
exports.module = empty
exports.net = empty
exports.os = 'os-browserify/browser.js'
exports.path = 'path-browserify'
exports.punycode = 'punycode'
exports.querystring = 'querystring-es3'
exports.readline = empty
exports.repl = empty
exports.stream = 'stream-browserify'
exports._stream_duplex = 'readable-stream/duplex.js'
exports._stream_passthrough = 'readable-stream/passthrough.js'
exports._stream_readable = 'readable-stream/readable.js'
exports._stream_transform = 'readable-stream/transform.js'
exports._stream_writable = 'readable-stream/writable.js'
exports.string_decoder = 'string_decoder'
exports.sys = 'util/util.js'
exports.timers = 'timers-browserify'
exports.tls = empty
exports.tty = 'tty-browserify'
exports.url = 'url'
exports.util = 'util/util.js'
exports.vm = 'vm-browserify'
exports.zlib = 'browserify-zlib'

// rename to nlz.io URLs
Object.keys(exports).forEach(function (name) {
  if (exports[name] === empty) return
  var value = exports[name].split('/')
  exports[name] = 'https://nlz.io/npm/-/'
    + value.shift()
    + '/*/'
    + (value.join('/') || 'index.js')
})
