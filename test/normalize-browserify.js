
var co = require('co')
var fs = require('co-fs')
var get = require('raw-body')

var request = require('./request')
var server = require('../app/server')
var store = require('../config').store

describe('normalize package.json', function () {
  describe('normalize/transforms.js', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/normalize/transforms.js/*/README.md')
      res.statusCode.should.equal(302)
      res.resume()
    }))
  }))

  describe('barberboy/dom-elements@0.1.0', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/barberboy/dom-elements/0.1.0/src/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should rewrite folder lookups', co(function* () {
      var string = yield fs.readFile(store + 'github/barberboy/dom-elements/0.1.0/src/index.js', 'utf8')
      string.should.not.include('./methods.js')
      string.should.include('./methods/index.js')
    }))

    it('should support .. relative paths', co(function* () {
      var string = yield fs.readFile(store + 'github/barberboy/dom-elements/0.1.0/src/elements/index.js', 'utf8')
      string.should.not.include('could not resolve')
    }))
  })

  describe('WebReflection/dom4@1.0.1', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/webreflection/dom4/1.0.1/src/dom4.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  })

  describe('facebook/jstransform@4.0.1', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download even though normalization fails because of the crazy esprima dep', co(function* () {
      res = yield* request('/npm/-/jstransform/4.0.1/index.js')
      res.statusCode.should.equal(404)
      res.resume()
    }))
  })

  describe('substack/browserify@3.44.2', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/npm/-/browserify/3.44.2/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  })

  describe('segmentio/builtins@0.0.4', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/npm/-/builtins/0.0.4/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should proxy index.js', co(function* () {
      var string = yield fs.readFile(store + 'npm/-/builtins/0.0.4/index.js', 'utf8')
      string.trim().replace(/\/\/.+/, '')
        .should.equal('module.exports = require("./builtins.json.js")')
    }))
  })

  describe('twbs/bootstrap@3.1.1', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/twbs/bootstrap/3.1.1/index.css')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should proxy index.css', co(function* () {
      var string = yield fs.readFile(store + 'github/twbs/bootstrap/3.1.1/index.css', 'utf8')
      string.trim().should.equal('@import "./dist/css/bootstrap.css";')
    }))
  })

  describe('isaacs/inherits@2.0.1', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/npm/-/inherits/2.0.1/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  })

  describe('defunctzombie/synthetic-dom-events@0.2.2', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/npm/-/synthetic-dom-events/0.2.2/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should rewrite .json requires', co(function* () {
      var string = yield fs.readFile(store + 'npm/-/synthetic-dom-events/0.2.2/index.js', 'utf8')
      string.should.not.include("'./init.json'")
      string.should.not.include("'./types.json'")
      string.should.include('"./init.json.js"')
      string.should.include('"./types.json.js"')
    }))
  })

  describe('defunctzombie/node-url@0.10.1', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/npm/-/url/0.10.1/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should proxy main files', co(function* () {
      yield fs.stat(store + 'npm/-/punycode/1.2.4/index.js')
      yield fs.stat(store + 'npm/-/url/0.10.1/index.js')
    }))

    it('should rewrite the punycode dependency', co(function* () {
      var string = yield fs.readFile(store + 'npm/-/url/0.10.1/url.js', 'utf8')
      string.should.not.include("'punycode'")
      string.should.include('"https://nlz.io/npm/-/punycode/1.2.4/index.js"')
    }))
  })

  describe('defunctzombie/node-util@0.10.3', function () {
    var res
    var string

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/npm/-/util/0.10.3/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should rewrite inherits dependency', co(function* () {
      string = yield fs.readFile(store + 'npm/-/util/0.10.3/util.js', 'utf8')
      string.should.not.include("'inherit'")
      string.should.include('"https://nlz.io/npm/-/inherits/2.0.1/index.js"')
    }))

    it('should rewrite local .browser aliases', co(function* () {
      string.should.not.include("require('./support/isBuffer')")
      string.should.include('require("./support/isBufferBrowser.js")')
    }))
  })
})
