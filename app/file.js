
var fs = require('fs')
var url = require('url')
var flatten = require('normalize-walker').flatten

var route = require('./route')
var cacheControl = require('../config').cacheControl

// should be able to combine this somehow...
var matchEntryPoint = route(route.project + '/:version/')
var matchAnyFile = route(route.project + '/:version/:file*')

module.exports = function* (next) {
  var path = this.request.path
  var params = matchEntryPoint(path)
    || matchAnyFile(path)
  if (!params) return yield* next

  var res = this.uri.parseRemote(this.request.path)
  var uri = this.uri.remote(res)

  var tree = yield* this.walker().add(uri).tree()
  var file = tree[uri].file
  uri = this.uri.localToRemote(file.uri)

  if (url.parse(uri).pathname !== path) {
    this.response.redirect(uri)
    this.response.set('Cache-Control', cacheControl.semver)
    // push this file with highest priority
    if (this.spdy) this.push.call(this, file, 0)
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
  }).forEach(this.push, this)
}
