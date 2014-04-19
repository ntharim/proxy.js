
var route = require('path-match')()
var flatten = require('normalize-walker').flatten

var Walker = require('../lib')
var push = require('../lib/push')
var utils = require('../lib/utils')
var resolve = require('../lib/resolve')
var serialize = require('../lib/serialize')
var cacheControl = require('../config').cacheControl

var calculate = utils.shasum
var localPath = utils.localPath
var remotePath = utils.remotePath

var match = route('/:user([\\w-]+)/:project([\\w-.]+)/:version/manifest.json')

module.exports = function* (next) {
  var params = match(this.request.path)
  if (!params) return yield* next

  var remote = this.remote
  var user = params.user.toLowerCase()
  var project = params.project.toLowerCase()
  var range = params.version.toLowerCase() || '*'
  var uri = remotePath(remote, user, project, range)
  var res = yield* resolve(uri)
  var version = res[3]
  var main = yield* utils.entrypoints(localPath(remote, user, project, version))
  var manifest = {
    repository: 'https://' + remote.domain + '/' + user + '/' + project,
    version: version,
    main: main,
  }
  uri = remotePath(remote, user, project, version)

  var walker = Walker()
  main.forEach(function (file) {
    walker.add(uri + file)
  })
  var tree = yield* walker.tree()
  manifest.files = serialize(tree)

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
  flatten(tree).forEach(push, this)
}
