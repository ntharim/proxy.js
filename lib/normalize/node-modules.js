
/**
 * Equivalent to https://github.com/substack/node-browserify/blob/master/lib/builtins.js
 * We treat all these dependencies as github dependencies.
 *
 * To do: specify versions when resolving
 */

var empty = 'https://github.com/substack/node-browserify/*/lib/_empty.js'

exports.assert = 'https://github.com/defunctzombie/commonjs-assert/*/index.js'
exports.buffer = 'https://github.com/feross/buffer/*/index.js'
exports.child_process = empty
exports.cluster = null
exports.console = 'https://github.com/raynos/console-browserify/*/index.js'
exports.crypto = 'https://github.com/dominictarr/crypto-browserify/*/index.js'
exports.dgram = empty
exports.dns = empty
exports.domain = 'https://github.com/bevry/domain-browser/*/index.js'
exports.events = 'https://github.com/gozala/events/*/index.js'
exports.fs = empty
exports.http = 'https://github.com/substack/http-browserify/*/index.js'
exports.https = 'https://github.com/substack/https-browserify/*/index.js'
exports.module = empty
exports.net = empty
exports.os = 'https://github.com/coderpuppy/os-browserify/*/index.js'
exports.path = 'https://github.com/substack/path-browserify/*/index.js'
exports.punycode = 'https://github.com/bestiejs/punycode.js/*/index.js'
exports.querystring = 'https://github.com/gozala/querystring/*/index.js'
exports.readline = empty
exports.repl = empty
exports.stream = 'https://github.com/substack/stream-browserify/*/index.js'
exports._stream_duplex = 'https://github.com/substack/stream-browserify/*/duplex.js'
exports._stream_passthrough = 'https://github.com/substack/stream-browserify/*/passthrough.js'
exports._stream_readable = 'https://github.com/substack/stream-browserify/*/readable.js'
exports._stream_transform = 'https://github.com/substack/stream-browserify/*/transform.js'
exports._stream_writable = 'https://github.com/substack/stream-browserify/*/writable.js'
exports.string_decoder = 'https://github.com/rvagg/string_decoder/*/index.js'
exports.sys = 'https://github.com/defunctzombie/node-util/*/index.js'
exports.timers = 'https://github.com/jryans/timers-browserify/*/index.js'
exports.tls = empty
exports.tty = 'https://github.com/substack/tty-browserify/*/index.js'
exports.url = 'https://github.com/defunctzombie/node-url/*/index.js'
exports.util = exports.sys
exports.vm = 'https://github.com/substack/vm-browserify/*/index.js'
exports.zlib = 'https://github.com/devongovett/browserify-zlib/*/index.js'
