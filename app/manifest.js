
var flatten = require('normalize-walker').flatten

var route = require('./route')
var calculate = require('../lib/utils').shasum
var cacheControl = require('../config').cacheControl

var match = route(route.project + '/:version/manifest.json')

module.exports = function* (next) {
  var params = match(this.request.path)
  if (!params) return yield* next

  var res = this.uri.parseRemote(this.request.path).slice(0, 4)
  var range = res[3]
  var uri = this.uri.remote(res)
  res = yield* this.resolve(res)
  var version = res[3]
  var main = yield* this.entrypoints(this.uri.local(res))
  var manifest = {
    repository: 'https://' + res[0].hostname + '/' + res[1] + '/' + res[2],
    version: version,
    main: main,
  }
  uri = this.uri.remote(res)

  var walker = this.walker()
  main.forEach(function (file) {
    walker.add(uri + '/' + file)
  })
  var tree = yield* walker.tree()
  manifest.files = this.serialize(tree)

  var string = JSON.stringify(manifest, null, 2)
  this.response.etag = calculate(string)
  this.response.type = 'json'
  this.response.body = string
  this.response.set('Cache-Control', version === range
    ? cacheControl.file
    : cacheControl.semver)
  if (this.request.fresh) return this.response.status = 304

  // spdy push all the shit
  if (!this.spdy) return
  flatten(tree).forEach(function (file) {
    this.push(file, true)
  }, this)
}
