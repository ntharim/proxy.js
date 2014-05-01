
var route = require('./route')
var match = route(route.project + '/:version/pull')

module.exports = function* (next) {
  var path = this.request.path
  var params = match(path)
  if (!params) return yield* next

  yield* this.resolve(this.uri.parseRemote(path))
  this.response.status = 204
}
