
var enumerate = require('enumerate-error')

module.exports = function* (next) {
  var status
  try {
    yield* next

    status = this.response.status
    if (!status || (status === 404 && this.response.body == null)) this.throw(404)
  } catch (err) {
    enumerate(err)
    // "get" the properties
    err.message
    err.stack
    err.type
    err.name
    status =
    this.response.status =
    err.status = err.status || 500
    this.response.body = err
    if (!err.expose && status >= 500) this.app.emit('error', err, this)
  }
}
