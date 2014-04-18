
var co = require('co')

var request = require('./request')
var server = require('../app/server')

before(function (done) {
  server.listen(function (err) {
    if (err) throw err
    request.port = server.address().port
    done()
  })
})

describe('GET /remotes', function () {
  it('should support github', co(function* () {
    var res = yield* request('/remotes.json')
    console.log(res)
  }))
})

describe('GET /:user/:project/versions.json', function () {

})

describe('GET /:user/:project/:version/manifest', function () {

})

describe('GET /:user/:project/:version/:entrypoint', function () {

})

describe('GET /:user/:project/:version/:file', function () {

})
