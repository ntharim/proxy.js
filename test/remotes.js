
var remotes = require('../lib/remotes')

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
})
