
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

describe('GET /proxy.json', function () {
  var res
  var proxy

  after(function () {
    res.agent.close()
  })

  it('should support github', co(function* () {
    res = yield* request('/proxy.json')
    res.statusCode.should.equal(200)
    proxy = JSON.parse(yield get(res, true))
    proxy.hostname.should.equal('nlz.io')
    var github = proxy.remotes[0]
    github.name.should.equal('github')
    github.hostname.should.equal('github.com')
    github.aliases.should.include('raw.github.com')
    github.namespace.should.equal(true)
  }))

  it('should support npm', function () {
    var npm = proxy.remotes[1]
    npm.name.should.equal('npm')
    npm.namespace.should.equal(false)
  })

  it('should return the version', function () {
    proxy.version.should.equal(require('../package.json').version)
  })
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

  it('should GET /github/component-test/deps-any/*/index.js', co(function* () {
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

describe('GET /:remote/:user/:project/:version/:file?source', function () {
  var res
  var text

  after(function () {
    res.streams.forEach(function (stream) {
      stream.destroy()
    })
    res.agent.close()
  })

  it('should GET github/component-test/json-transform/0.0.1/something.json.js?source', co(function* () {
    res = yield* request('/github/component-test/json-transform/0.0.1/something.json.js?source')
    res.statusCode.should.equal(302)
    res.headers.location.should.equal('/github/component-test/json-transform/0.0.1/something.json?source')
    res.resume()
  }))

  it('should get the source', co(function* () {
    while (res.streams.length !== 1) {
      yield function (done) {
        res.on('push', function () {
          done()
        })
      }
    }

    var urls = res.streams.map(function (res) {
      return res.url
    })

    urls.should.include('/github/component-test/json-transform/0.0.1/something.json?source')
  }))
})

describe('GET /:remote/:user/:project/:semver/:file?source', function () {
  var res
  var text

  after(function () {
    res.streams.forEach(function (stream) {
      stream.destroy()
    })
    res.agent.close()
  })

  it('should GET github/component-test/json-transform/*/something.json.js?source', co(function* () {
    res = yield* request('/github/component-test/json-transform/*/something.json.js?source')
    res.statusCode.should.equal(302)
    res.headers.location.should.equal('/github/component-test/json-transform/0.0.1/something.json?source')
    res.resume()
  }))

  it('should get the source', co(function* () {
    while (res.streams.length !== 1) {
      yield function (done) {
        res.on('push', function () {
          done()
        })
      }
    }

    var urls = res.streams.map(function (res) {
      return res.url
    })

    urls.should.include('/github/component-test/json-transform/0.0.1/something.json?source')
  }))
})

describe('Push Streams', function () {
  var res

  afterEach(function () {
    res.streams.forEach(function (stream) {
      stream.destroy()
    })
    res.agent.close()
  })

  describe('GET /github/component-test/json-transform/0.0.1/index.js', function () {
    it('should push the transformed file', co(function* () {
      res = yield* request('/github/component-test/json-transform/0.0.1/index.js')
      res.statusCode.should.equal(200)

      while (res.streams.length !== 1) {
        yield function (done) {
          res.on('push', function () {
            done()
          })
        }
      }

      res.streams[0].url.should.equal('/github/component-test/json-transform/0.0.1/something.json.js')
    }))
  })
})

describe('GET nonexistent file', function () {
  it('should 404', co(function* () {
    res = yield* request('/github/component-test/deps-any/0.0.0/kljljasdfsdafsdf.js')
    res.statusCode.should.equal(404)
    res.destroy()
    res.agent.close()
  }))
})
