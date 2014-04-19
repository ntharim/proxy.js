
var route = require('./route')
var utils = require('../lib/utils')
var versions = require('../lib/versions')
var cacheControl = require('../config').cacheControl.versions

var calculate = utils.shasum
var match = route(route.project + '/versions.json')

/**
 * Return a list of all currently installed versions of a repository.
 */

module.exports = function* (next) {
  var params = match(this.request.path)
  if (!params) return yield* next

  var res = this.uri.parseRemote(this.request.path)
  var body = yield* versions(this.uri.local(res.slice(0, 3)))
  this.response.body = body
  this.response.etag = calculate(JSON.stringify(body))
  this.response.set('Cache-Control', cacheControl)
  if (this.request.fresh) this.response.status = 304
  else if (!body.length) this.response.status = 404
}
