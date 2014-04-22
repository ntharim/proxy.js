
var co = require('co')
var fs = require('co-fs')
var get = require('raw-body')

var request = require('./request')
var server = require('../app/server')

describe('normalize component.json', function () {
  describe('component-test/normalize-multiple-component@0.0.0', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github.com/component-test/normalize-multiple-component/0.0.0/manifest.json')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  describe('jonathanong/horizontal-grid-packing@0.1.4', function () {
    var res
    var files

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github.com/jonathanong/horizontal-grid-packing/0.1.4/manifest.json')
      res.statusCode.should.equal(200)
      var manifest = JSON.parse(yield get(res, true))
      files = manifest.files.map(function (file) {
        return file.uri
      })
    }))

    it('should resolve', co(function* () {
      files.should.include('https://nlz.io/github/jonathanong/horizontal-grid-packing/0.1.4/index.js')
      files.should.include('https://nlz.io/github/jonathanong/horizontal-grid-packing/0.1.4/index.css')
      files.should.include('https://nlz.io/github/jonathanong/horizontal-grid-packing/0.1.4/lib/pack.js')
      files.should.include('https://nlz.io/github/jonathanong/horizontal-grid-packing/0.1.4/lib/pack.css')
    }))
  })

  describe('visionmedia/jade@1.3.1', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github.com/visionmedia/jade/1.3.1/manifest.json')
      res.statusCode.should.equal(200)
      res.resume()
    }))

    it('should rewrite require("fs")', co(function* () {
      var string = yield fs.readFile(process.cwd() + '/repositories/github/visionmedia/jade/1.3.1/lib/runtime.js', 'utf8')
      string.should.not.include("require('fs')")
      string.should.include('require("https://nlz.io/github/substack/node-browserify/*/lib/_empty.js")')
    }))
  })

  describe('component/to-function@2.0.0', co(function* () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github.com/component/to-function/2.0.0/manifest.json')
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
      res = yield* request('/github.com/component/each/0.2.3/manifest.json')
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
      res = yield* request('/github.com/ianstormtaylor/to-camel-case/0.2.1/manifest.json')
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
      res = yield* request('/github.com/component/within-document/0.0.1/manifest.json')
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
      res = yield* request('/github.com/visionmedia/debug/0.8.1/manifest.json')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  // describe('component/css@0.0.5', co(function* () {
  //   var res
  //
  //   after(function () {
  //     res.agent.close()
  //   })
  //
  //   it('should download', co(function* () {
  //     res = yield* request('/github.com/component/css/0.0.5/manifest.json')
  //     res.statusCode.should.equal(200)
  //     res.resume()
  //   }))
  // }))

  // describe('component/dom@1.0.5', co(function* () {
  //   var res
  //
  //   after(function () {
  //     res.agent.close()
  //   })
  //
  //   it('should download', co(function* () {
  //     res = yield* request('/github.com/component/dom/1.0.5/manifest.json')
  //     res.statusCode.should.equal(200)
  //     res.resume()
  //   }))
  // }))
  //
  // describe('component/calendar@0.1.0', co(function* () {
  //   var res
  //
  //   after(function () {
  //     res.agent.close()
  //   })
  //
  //   it('should download', co(function* () {
  //     res = yield* request('/github.com/component/calendar/0.1.0/manifest.json')
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
      res = yield* request('/github.com/component/s3/0.4.0/manifest.json')
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
      res = yield* request('/github.com/visionmedia/superagent/0.17.0/manifest.json')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  // https://github.com/enyo/domready/issues/2
  // describe('component/tip@1.0.3', co(function* () {
  //   var res
  //
  //   after(function () {
  //     res.agent.close()
  //   })
  //
  //   it('should download', co(function* () {
  //     res = yield* request('/github.com/component/tip/1.0.3/manifest.json')
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
      res = yield* request('/github.com/jonathanong/eevee/0.0.4/manifest.json')
      res.statusCode.should.equal(200)
      res.resume()
    }))
  }))

  // describe('jonathanong/delegated-dropdown@0.0.7', co(function* () {
  //   var res
  //
  //   after(function () {
  //     res.agent.close()
  //   })
  //
  //   it('should download', co(function* () {
  //     res = yield* request('/github.com/jonathanong/delegated-dropdown/0.0.7/manifest.json')
  //     res.statusCode.should.equal(200)
  //     res.resume()
  //   }))
  // }))

  // describe('jonathanong/autocomplete@0.1.5', co(function* () {
  //   var res
  //
  //   after(function () {
  //     res.agent.close()
  //   })
  //
  //   it('should download', co(function* () {
  //     res = yield* request('/github.com/jonathanong/autocomplete/0.1.5/manifest.json')
  //     res.statusCode.should.equal(200)
  //     res.resume()
  //   }))
  // }))
})
