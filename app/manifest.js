
var route = require('path-match')()

var Walker = require('../lib')
var utils = require('../utils')
var resolve = require('../lib/resolve')
var remotes = require('../lib/remotes')
var serialize = require('../lib/serialize')

var calculate = utils.shasum
var localPath = utils.localPath
var remotePath = utils.remotePath

var match = route('/:user([\\w-]+)/:project([\\w-.]+)/:version/manifest.json')

module.exports = function* (next) {
  var params = match(this.request.path)
  if (!params) return yield* next

  var remote = remotes(this.request.hostname)
  if (!remote) this.throw(404, 'Unknown hostname.')
  var user = params.user.toLowerCase()
  var project = params.project.toLowerCase()
  var version = params.version.toLowerCase() || '*'
  var uri = remotePath(remote, user, project, version)
  var res = yield* resolve(uri)
  version = res[3]
  var main = yield* utils.entrypoints(localPath(remote, user, project, version))
  var manifest = {
    repository: 'https://' + remote.domain + '/' + user + '/' + project,
    main: main,
  }
  uri = remotePath(remote, user, project, version)

  var walker = Walker()
  main.forEach(function (file) {
    walker.add(uri + file)
  })
  var tree = yield* walker.tree()
  var files = manifest.files = serialize(tree)

  var string = JSON.stringify(manifest, null, 2)
  this.response.etag = calculate(string)
  this.response.type = 'json'
  this.response.body = string
  if (this.request.fresh) this.response.status = 304

  // spdy push all the shit
}
