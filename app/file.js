
var fs = require('fs')
var url = require('url')
var inspect = require('util').inspect
var extname = require('path').extname
var flatten = require('normalize-walker').flatten
var debug = require('debug')('normalize-proxy:app:file')

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

  debug('path %s got params %s', path, inspect(params))

  var source
  var minified
  var search = this.request.search
  switch (search) {
  case '?source':
    source = search
    break
  case '?minified':
    minified = search
    break
  case '':
    break
  default:
    this.throw(404, 'invalid query string. only ?search and ?minified allowed.')
  }

  var uri = this.uri.remote(
    this.remotes(params.remote),
    params.user,
    params.project,
    params.version,
    ((params.file || '') + (params.tail || '')) || 'index.html'
  )

  debug('resolved to uri %s', uri)

  var tree = yield* this.walker().add(uri).tree()
  var file = tree[uri].file
  if (file.exists === false) this.throw(404)

  uri = this.uri.localToRemote(source ? file.source : file.uri)
  var uripath = url.parse(uri).pathname

  if (uripath !== path) {
    this.response.redirect(uripath + search)
    this.response.set('Cache-Control', cacheControl.semver)
    // push this file with highest priority
    if (this.spdy) this.push(file, search, 0)
  } else {
    this.response.set('Cache-Control', cacheControl.file)
    this.response.etag = file.hash
    this.response.lastModified = file.mtime
    if (this.request.fresh) return this.response.status = 304

    if (source) {
      this.response.type = extname(file.source)
      if (this.request.method === 'HEAD') return this.response.status = 200
      this.response.body = fs.createReadStream(file.source)
    } else if (minified && file.is('js', 'css')) {
      this.response.type = file.type
      this.response.body = file.minified
    } else {
      this.response.type = file.type
      if ('string' in file) {
        this.response.body = file.string
      } else {
        if (this.request.method === 'HEAD') this.response.status = 200
        else this.response.body = fs.createReadStream(file.uri)
      }
    }
  }

  // spdy push all the shit
  if (!this.spdy) return
  flatten(tree).filter(function (x) {
    return file !== x
  }).forEach(function (file) {
    this.push(file, search)
  }, this)
}
