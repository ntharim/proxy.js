
var co = require('co')
var get = require('raw-body')

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
    var body = JSON.parse(yield get(res, true))
    body.hostname.should.equal('normalize.us')
    var github = body.remotes[0]
    github.name.should.equal('github')
    github.hostname.should.equal('github.normalize.us')
    github.aliases.should.include('raw.github.com')
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
