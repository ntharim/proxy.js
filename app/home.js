
module.exports = function* (next) {
  if (this.request.path !== '/') return yield* next

  this.response.body = '<p>Hello!</p>'
}
