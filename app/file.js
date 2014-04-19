
var fs = require('fs')
var route = require('path-match')()
var flatten = require('normalize-walker').flatten

var Walker = require('../lib')
var push = require('../lib/push')
var utils = require('../lib/utils')
var cacheControl = require('../config').cacheControl

var remotePath = utils.remotePath

var matchEntryPoint = route('/:user([\\w-]+)/:project([\\w-.]+)/:version/:file(index.js|index.css|index.html)?')
var matchAnyFile = route('/:user([\\w-]+)/:project([\\w-.]+)/:version/:file*')

module.exports = function* (next) {
  var path = this.request.path
  var params = matchEntryPoint(path)
    || matchAnyFile(path)
  if (!params) return yield* next

  var remote = this.remote
  var user = params.user.toLowerCase()
  var project = params.project.toLowerCase()
  var version = params.version.toLowerCase() || '*'
  var file = params.file + (params.tail || '')
  var uri = remotePath(remote, user, project, version, file)

  var walker = Walker()
  walker.add(uri)
  var tree = yield* walker.tree()
  var file = tree[uri].file
  uri = utils.localToRemotePath(file.uri)

  if (uri !== this.uri) {
    this.response.redirect(uri)
    this.response.set('Cache-Control', cacheControl.semver)
    // push this file with highest priority
    if (this.spdy) push.call(this, file, 0)
  } else {
    this.response.etag = file.hash
    this.response.lastModified = file.mtime
    if (this.request.fresh) return this.response.status = 304
    this.response.type = file.type
    if (file.string) {
      this.response.body = file.string
    } else {
      this.response.length = file.length
      if (this.request.method === 'HEAD') this.response.status = 200
      else this.response.body = fs.createReadStream(file.uri)
    }
  }

  // spdy push all the shit
  if (!this.spdy) return
  flatten(tree).filter(function (x) {
    return file !== x
  }).forEach(push, this)
}
