
var assert = require('assert')

var remotes = require('../lib/remotes')
var uris = require('../lib/uri')

describe('Remotes', function () {
  describe('GitHub', function () {
    it('should have all aliases', function () {
      remotes('github').name.should.equal('github')
      remotes('github.com').name.should.equal('github')
      remotes('api.github.com').name.should.equal('github')
      remotes('raw.github.com').name.should.equal('github')
      remotes('raw.githubusercontent.com').name.should.equal('github')
    })
  })

  describe('NPM', function () {
    it('should throw when the userspace is not "-"', function () {
      assert.throws(function () {
        uris.parseRemote('https://nlz.io/npm/lkjasdf/emitter/1.0.0/index.js')
      })
    })
  })
})
