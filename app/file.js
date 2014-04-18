
var fs = require('fs')
var route = require('path-match')()
var flatten = require('normalize-walker').flatten

var Walker = require('../lib')
var push = require('../lib/push')
var utils = require('../lib/utils')
var remotes = require('../lib/remotes')

var remotePath = utils.remotePath

var matchEntryPoint = route('/:user([\\w-]+)/:project([\\w-.]+)/:version/:file(index.js|index.css|index.html)?')
var matchAnyFile = route('/:user([\\w-]+)/:project([\\w-.]+)/:version/:file*')

module.exports = function* (next) {
  var path = this.request.path
  var params = matchEntryPoint(path)
    || matchAnyFile(path)
  if (!params) return yield* next

  var remote = remotes(this.request.hostname)
  if (!remote) this.throw(404, 'Unknown hostname.')
  var user = params.user.toLowerCase()
  var project = params.project.toLowerCase()
  var version = params.version.toLowerCase() || '*'
  var file = params.file + (params.tail || '')
  var uri = remotePath(remote, user, project, version, file)

  var walker = Walker()
  walker.add(uri)
  var tree = yield* walker.tree()
  var file = tree[uri].file

  this.response.etag = file.hash
  this.response.lastModified = file.mtime
  if (this.request.fresh) return this.response.status = 304

  this.response.type = file.type
  if (file.string) {
    this.response.body = file.string
  } else {
    // to do: HEAD support
    this.response.length = file.length
    this.response.body = fs.createReadStream(file.uri)
  }

  // spdy push all the shit
  if (!this.res.isSpdy) return
  flatten(tree).filter(function (x) {
    return file !== x
  }).forEach(push, this)
}
