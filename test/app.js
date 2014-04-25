
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
    body.hostname.should.equal('nlz.io')
    var github = body.remotes[0]
    github.name.should.equal('github')
    github.hostname.should.equal('github.com')
    github.aliases.should.include('raw.github.com')
    res.agent.close()
  }))
})

describe('GET /:remote/:user/:project/versions.json', function () {
  it('should 404 when there are no versions installed', co(function* () {
    var res = yield* request('/github/asdfasdf/asdfasdf/versions.json')
    res.statusCode.should.equal(404)
    res.headers['content-type'].should.equal('application/json')
    var body = JSON.parse(yield get(res, true))
    body.should.eql([])
    res.agent.close()
  }))

  it('should GET github/component-test/deps-any', co(function* () {
    var res = yield* request('/github/component-test/deps-any/versions.json')
    res.statusCode.should.equal(200)
    var body = JSON.parse(yield get(res, true))
    body.should.include('0.0.0')
    res.agent.close()
  }))

  it('should GET github/component-test/index', co(function* () {
    var res = yield* request('/github/component-test/index/versions.json')
    res.statusCode.should.equal(200)
    var body = JSON.parse(yield get(res, true))
    body.should.include('0.0.0')
    res.agent.close()
  }))
})

describe('GET /:remote/:user/:project/:version/manifest.json', function () {
  var res

  after(function () {
    res.streams.forEach(function (stream) {
      stream.destroy()
    })
    res.agent.close()
  })

  it('should GET github/component-test/deps-any/0.0.0', co(function* () {
    res = yield* request('/github/component-test/deps-any/0.0.0/manifest.json')
    res.statusCode.should.equal(200)
    res.headers['content-type'].should.equal('application/json')
    var manifest = JSON.parse(yield get(res, true))
    manifest.version.should.equal('0.0.0')
    manifest.main.should.include('index.js')
    manifest.main.should.include('index.css')
    manifest.files.length.should.be.ok
  }))

  it('should get all 6 streams', co(function* () {
    while (res.streams.length !== 6) {
      yield function (done) {
        res.on('push', function () {
          done()
        })
      }
    }

    var urls = res.streams.map(function (res) {
      return res.url
    })

    urls.should.include('/github/component-test/deps-any/0.0.0/index.js')
    urls.should.include('/github/component-test/deps-any/0.0.0/index.css')
    urls.should.include('/github/component-test/index/0.0.0/index.js')
  }))

  it('should rewrite dependencies', co(function* () {
    var stream = res.streams.filter(function (stream) {
      return stream.url === '/github/component-test/deps-any/0.0.0/index.js'
    }).shift()
    var text = yield get(stream, true)
    text.trim().should.include('"https://nlz.io/github/component-test/index/*/index.js"')
    text.trim().should.include('require("https://nlz.io/github/component-test/index/*/index.js")')
  }))
})

describe('GET /:remote/:user/:project/:semver/manifest.json', function () {
  var res

  after(function () {
    res.streams.forEach(function (stream) {
      stream.destroy()
    })
    res.agent.close()
  })

  it('should GET github/component-test/deps-any/*', co(function* () {
    res = yield* request('/github/component-test/deps-any/*/manifest.json')
    res.statusCode.should.equal(200)
    var manifest = JSON.parse(yield get(res, true))
    manifest.version.should.equal('0.0.0')
    manifest.main.should.include('index.js')
    manifest.main.should.include('index.css')
    manifest.files.length.should.be.ok
  }))

  it('should get all 6 streams', co(function* () {
    while (res.streams.length !== 6) {
      yield function (done) {
        res.on('push', function () {
          done()
        })
      }
    }

    var urls = res.streams.map(function (res) {
      return res.url
    })

    urls.should.include('/github/component-test/deps-any/0.0.0/index.js')
    urls.should.include('/github/component-test/deps-any/0.0.0/index.css')
    urls.should.include('/github/component-test/index/0.0.0/index.js')
  }))

  it('should rewrite dependencies', co(function* () {
    var stream = res.streams.filter(function (stream) {
      return stream.url === '/github/component-test/deps-any/0.0.0/index.js'
    }).shift()
    var text = yield get(stream, true)
    text.trim().should.include('"https://nlz.io/github/component-test/index/*/index.js"')
    text.trim().should.include('require("https://nlz.io/github/component-test/index/*/index.js")')
  }))
})

describe('GET /:remote/:user/:project/:version/:file', function () {
  var res
  var text

  after(function () {
    res.streams.forEach(function (stream) {
      stream.destroy()
    })
    res.agent.close()
  })

  it('should GET github/component-test/deps-any/0.0.0/index.js', co(function* () {
    res = yield* request('/github/component-test/deps-any/0.0.0/index.js')
    res.statusCode.should.equal(200)
    res.headers['content-type'].should.equal('application/javascript')
    text = yield get(res, true)
  }))

  it('should rewrite dependencies', co(function* () {
    text.trim().should.include('"https://nlz.io/github/component-test/index/*/index.js"')
    text.trim().should.include('require("https://nlz.io/github/component-test/index/*/index.js")')
  }))

  it('should get all 2 streams', co(function* () {
    while (res.streams.length !== 2) {
      yield function (done) {
        res.on('push', function () {
          done()
        })
      }
    }

    var urls = res.streams.map(function (res) {
      return res.url
    })

    urls.should.include('/github/component-test/index/0.0.0/index.js')
    urls.should.include('/github/component-test/index/0.0.0/stuff.js')
  }))
})

describe('GET /:remote/:user/:project/:semver/:file', function () {
  var res

  after(function () {
    res.streams.forEach(function (stream) {
      stream.destroy()
    })
    res.agent.close()
  })

  it('should GET github/component-test/deps-any/*/index.js', co(function* () {
    res = yield* request('/github/component-test/deps-any/*/index.js')
    res.statusCode.should.equal(302)
    res.headers.location.should.equal('/github/component-test/deps-any/0.0.0/index.js')
  }))

  it('should get all 3 streams', co(function* () {
    while (res.streams.length !== 3) {
      yield function (done) {
        res.on('push', function () {
          done()
        })
      }
    }

    var urls = res.streams.map(function (res) {
      return res.url
    })

    urls.should.include('/github/component-test/deps-any/0.0.0/index.js')
    urls.should.include('/github/component-test/index/0.0.0/index.js')
    urls.should.include('/github/component-test/index/0.0.0/stuff.js')
  }))
})

describe('GET nonexistent file', function () {
  it('should 404', co(function* () {
    res = yield* request('/github/component-test/deps-any/0.0.0/kljljasdfsdafsdf.js')
    res.statusCode.should.equal(404)
    res.destroy()
    res.agent.close()
  }))
})
