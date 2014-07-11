
var co = require('co')
var fs = require('co-fs')
var get = require('raw-body')

var request = require('./request')
var server = require('../app/server')
var store = require('../config').store

describe('ES6 Modules', function () {
  describe('jonathanong/lodash-es63.0.0', function () {
    var res

    after(function () {
      res.agent.close()
    })

    it('should download', co(function* () {
      res = yield* request('/github/jonathanong/lodash-es6/3.0.0/modern/function/memoize.js')
      res.statusCode.should.equal(200)

      while (res.streams.length !== 1) {
        yield function (done) {
          res.on('push', function () {
            done()
          })
        }
      }

      res.streams[0].url.should.equal('/github/jonathanong/lodash-es6/3.0.0/modern/object/isFunction.js')
    }))
  })
})
