
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
    res.statusCode.should.equal(200)
    var body = JSON.parse(yield get(res, true))
    body.hostname.should.equal('normalize.us')
    var github = body.remotes[0]
    github.name.should.equal('github')
    github.hostname.should.equal('github.normalize.us')
    github.aliases.should.include('raw.github.com')
    res.agent.close()
  }))
})

describe('GET /:user/:project/versions.json', function () {
  it('should GET component-test/deps-any', co(function* () {
    var res = yield* request('/component-test/deps-any/versions.json')
    res.statusCode.should.equal(200)
    var body = JSON.parse(yield get(res, true))
    body.should.include('0.0.0')
    res.agent.close()
  }))

  it('should GET component-test/index', co(function* () {
    var res = yield* request('/component-test/index/versions.json')
    res.statusCode.should.equal(200)
    var body = JSON.parse(yield get(res, true))
    body.should.include('0.0.0')
    res.agent.close()
  }))
})

describe('GET /:user/:project/:version/manifest', function () {

})

describe('GET /:user/:project/:version/:file', function () {

})

describe('GET /:user/:project/:semver/:file', function () {

})
