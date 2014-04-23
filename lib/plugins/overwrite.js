
var fs = require('co-fs')
var debug = require('debug')('normalize-proxy:plugins:overwrite')

/**
 * If file.overwrite = true, save it.
 */

exports.save = function () {
  return function* (next) {
    yield* next

    var file = this.file
    if (!file || !file.overwrite) return
    if (file.uri !== file.source) return // not sure when this would happen
    debug('overwriting %s', file.uri)
    yield fs.writeFile(file.uri, file.string)
  }
}
