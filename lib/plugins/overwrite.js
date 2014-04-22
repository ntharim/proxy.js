
var fs = require('co-fs')
var dependencies = require('normalize-dependencies').js
var debug = require('debug')('normalize-proxy:plugins:overwrite')

/**
 * Kind of like rewrite, except it overwrites dependencies.
 * Specifically for normalize/common.js.
 * Should be placed before the .js() plugin
 */

exports.js = function (overwriter) {
  return function* overwriteJS(next) {
    if (!this.is('js')) return yield* next

    var file = this.file
    if (!file) file = this.file = new this.File(this.uri)
    if (!file.source) yield* file.setSource(this.uri)

    var string = yield* file.getString()

    var deps = dependencies.match(string)
    var map = Object.create(null)
    for (var i = 0; i < deps.length; i++) {
      var name = deps[i].path
      var newname = yield* overwriter(file.uri, name)

      if (!newname) {
        file.log('plugins:overwrite:info', 'could not resolve dependency ' + name + ', ignoring')
        continue
      }

      debug('renaming %s\'s dependency %s to %s', this.remoteURI, name, newname)

      // ex. .json -> .json.js, .html -> .html.js,
      // but only if it's a relative dependency
      if (/^\.\//.test(newname) && !/\.js$/.test(newname)) newname += '.js'

      // don't overwrite unnecessarily
      if (name === newname) continue

      file.log('plugins:overwrite:info', 'rewriting dependency ' + name + ' to ' + newname)
      map[name] = newname
    }

    if (Object.keys(map).length) {
      file.string = dependencies.replace(string, map)
      file.overwrite = true
    }
    yield* next
  }
}

/**
 * If file.overwrite = true, save it.
 */

exports.save = function () {
  return function* (next) {
    yield* next

    var file = this.file
    if (!file || !file.overwrite) return
    if (file.uri !== file.source) return // not sure when this would happen
    debug('overwriting %s', this.remoteURI)
    yield fs.writeFile(file.uri, file.string)
  }
}
