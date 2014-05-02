
var co = require('co')
var fs = require('co-fs')
var get = require('raw-body')

var request = require('./request')
var server = require('../app/server')
var store = require('../config').store

describe('normalize package.json', function () {
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
      var string = yield fs.readFile(store + '/npm/-/builtins/0.0.4/index.js', 'utf8')
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
      var string = yield fs.readFile(store + '/github/twbs/bootstrap/3.1.1/index.css', 'utf8')
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
      var string = yield fs.readFile(store + '/npm/-/synthetic-dom-events/0.2.2/index.js', 'utf8')
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
      yield fs.stat(store + '/npm/-/punycode/1.2.4/index.js')
      yield fs.stat(store + '/npm/-/url/0.10.1/index.js')
    }))

    it('should rewrite the punycode dependency', co(function* () {
      var string = yield fs.readFile(store + '/npm/-/url/0.10.1/url.js', 'utf8')
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
      string = yield fs.readFile(store + '/npm/-/util/0.10.3/util.js', 'utf8')
      string.should.not.include("'inherit'")
      string.should.include('"https://nlz.io/npm/-/inherits/2.0.1/index.js"')
    }))

    it('should rewrite local .browser aliases', co(function* () {
      string.should.not.include("require('./support/isBuffer')")
      string.should.include('require("./support/isBufferBrowser.js")')
    }))
  })
})

describe('normalize component.json', function () {
  describe('component/classes@1.2.1', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/component/classes/1.2.1/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  })

  describe('component-test/normalize-multiple-component@0.0.0', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/component-test/normalize-multiple-component/0.0.0/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  })

  describe('jonathanong/horizontal-grid-packing@0.1.4', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/jonathanong/horizontal-grid-packing/0.1.4/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should resolve', co(function* () {
      yield fs.stat(store + 'github/jonathanong/horizontal-grid-packing/0.1.4/index.js')
      yield fs.stat(store + 'github/jonathanong/horizontal-grid-packing/0.1.4/index.css')
      yield fs.stat(store + 'github/jonathanong/horizontal-grid-packing/0.1.4/lib/pack.js')
      yield fs.stat(store + 'github/jonathanong/horizontal-grid-packing/0.1.4/lib/pack.css')
    }))
  })

  describe('visionmedia/jade@1.3.1', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/visionmedia/jade/1.3.1/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should rewrite require("fs")', co(function* () {
      var string = yield fs.readFile(process.cwd() + '/repositories/github/visionmedia/jade/1.3.1/lib/runtime.js', 'utf8')
      string.should.not.include("require('fs')")
      string.should.include('require("https://nlz.io/npm/-/browserify/*/lib/_empty.js")')
    }))
  })

  describe('component/to-function@2.0.0', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/component/to-function/2.0.0/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('component/each@0.2.3', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/component/each/0.2.3/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('ianstormtaylor/to-camel-case@0.2.1', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/ianstormtaylor/to-camel-case/0.2.1/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('component/within-document@0.0.1', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/component/within-document/0.0.1/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('visionmedia/debug@0.8.1', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/visionmedia/debug/0.8.1/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('component/css@0.0.5', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/component/css/0.0.5/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('component/dom@1.0.5', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/component/dom/1.0.5/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  // describe('component/calendar@0.1.0', co(function* () {
  //   var res
  //
  //   after(function () {
  //     res.agent.close()
  //   })
  //
  //   it('should download', co(function* () {
  //     res = yield* request('/github/component/calendar/0.1.0/index.js')
  //     res.statusCode.should.equal(200)
  //     res.resume()
  //   }))
  // }))

  describe('component/s3@0.4.0', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/component/s3/0.4.0/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('visionmedia/superagent@0.17.0', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/visionmedia/superagent/0.17.0/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  // wtf is going on here?
  // https://github.com/enyo/domready/issues/2
  // describe('component/tip@1.0.3', co(function* () {
  //   var res
  //
  //   after(function () {
  //     res.agent.close()
  //   })
  //
  //   it('should download', co(function* () {
  //     res = yield* request('/github/component/tip/1.0.3/index.js')
  //     res.statusCode.should.equal(200)
  //     res.resume()
  //   }))
  // }))

  describe('jonathanong/eevee@0.0.4', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/jonathanong/eevee/0.0.4/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('jonathanong/delegated-dropdown@0.0.7', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/jonathanong/delegated-dropdown/0.0.7/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('jonathanong/autocomplete@0.1.5', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/jonathanong/autocomplete/0.1.5/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))
})
