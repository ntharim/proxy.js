
var append = require('fs').appendFile

module.exports = function (prefix) {
  return function log(filename, type, message) {
    if (type instanceof Error) {
      type.stack.split('\n').forEach(function (line) {
        log(filename, 'error', line)
      })
      return
    }

    append(filename,
     'normalize:' + prefix + ':' + type + ': ' + message + '\n',
     noop)
  }
}

function noop() {}
