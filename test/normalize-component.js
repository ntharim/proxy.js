
var co = require('co')
var fs = require('co-fs')
var get = require('raw-body')

var request = require('./request')
var server = require('../app/server')
var store = require('../config').store

describe('normalize component.json', function () {
  describe('visionmedia/debug@1.0.1', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/visionmedia/debug/1.0.1/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should rewrite require("ms")', co(function* () {
      var string = yield fs.readFile(process.cwd() + '/repositories/github/visionmedia/debug/1.0.1/debug.js', 'utf8')
      string.should.not.include("require('ms')")
    }))
  }))

  describe('visionmedia/mocha@1.18.2', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/visionmedia/mocha/1.18.2/index.js')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  })

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
      string.should.include('require("https://nlz.io/github/normalize/empty/1/index.js")')
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
