
var assert = require('assert')
var rimraf = require('rimraf')
var co = require('co')
var fs = require('fs')

var Walker = require('../lib/walker')
var store = require('../config').store
var serialize = require('../lib/serialize')

function clean(done) {
  rimraf(store, done)
  Walker.cache.reset()
}

describe('Walker', function () {
  describe('component-test/remotes', function () {
    before(clean)

    var tree
    var filename

    it('should walk', co(function* () {
      var walker = Walker()
      walker.add('https://github.com/component-test/remotes/0.0.0/index.js')
      tree = yield* walker.tree()
    }))

    it('should have downloaded the repository', co(function* () {
      filename = store + 'github/component-test/remotes/0.0.0/index.js'
      assert(fs.existsSync(filename))
    }))

    it('should not have rewritten anything', co(function* () {
      var file = tree['https://github.com/component-test/remotes/0.0.0/index.js'].file
      file.string.should.equal(fs.readFileSync(filename, 'utf8'))
    }))
  })
  
  describe('component-test/index', function () {
    before(clean)

    var tree

    it('should walk', co(function* () {
      var walker = Walker()
      walker.add('https://github.com/component-test/index/0.0.0/index.js')
      walker.add('https://github.com/component-test/index/0.0.0/index.css')
      tree = yield* walker.tree()
    }))

    it('should have downloaded the repository', co(function* () {
      var folder = store + 'github/component-test/index/0.0.0/'
      assert(fs.existsSync(folder + 'index.js'))
      assert(fs.existsSync(folder + 'index.css'))
      assert(fs.existsSync(folder + 'something.css'))
      assert(fs.existsSync(folder + 'stuff.js'))
    }))

    it('should have rewritten the JS dependencies', co(function* () {
      var index = tree['https://github.com/component-test/index/0.0.0/index.js']
      index.uri.should.equal(store + 'github/component-test/index/0.0.0/index.js')
      index.remoteURI.should.equal('https://nrm.link/github/component-test/index/0.0.0/index.js')

      var file = index.file
      file.string.should.not.include('module stuff from "./stuff.js"')
      file.string.should.include('module stuff from "https://nrm.link/github/component-test/index/0.0.0/stuff.js"')

      file = file.dependencies['./stuff.js'].file
      assert.equal(file.string.trim(), 'export default \'hi\';')
    }))

    it('should have rewritten the CSS dependencies', function () {
      var index = tree['https://github.com/component-test/index/0.0.0/index.css']
      index.uri.should.equal(store + 'github/component-test/index/0.0.0/index.css')
      index.remoteURI.should.equal('https://nrm.link/github/component-test/index/0.0.0/index.css')

      var file = index.file
      file.string.should.not.include('@import "./something.css"')
      file.string.should.include('@import "https://nrm.link/github/component-test/index/0.0.0/something.css"')

      file = file.dependencies['./something.css'].file
      assert.equal(file.string.trim(), '* {\n  box-sizing: border-box;\n}')
    })
  })

  describe('component-test/deps-pinned', function () {
    before(clean)

    var tree
    var files

    it('should walk', co(function* () {
      var walker = Walker()
      walker.add('https://github.com/component-test/deps-pinned/0.0.0/index.js')
      walker.add('https://github.com/component-test/deps-pinned/0.0.0/index.css')
      tree = yield* walker.tree()
    }))

    it('should have downloaded component-test/index', co(function* () {
      var folder = store + 'github/component-test/index/0.0.0/'
      assert(fs.existsSync(folder + 'index.js'))
      assert(fs.existsSync(folder + 'index.css'))
      assert(fs.existsSync(folder + 'something.css'))
      assert(fs.existsSync(folder + 'stuff.js'))
    }))

    it('should have downloaded component-test/deps-pinned', co(function* () {
      var folder = store + 'github/component-test/deps-pinned/0.0.0/'
      assert(fs.existsSync(folder + 'index.js'))
      assert(fs.existsSync(folder + 'index.css'))
    }))

    it('should include all js files', function () {
      files = Walker.flatten(tree).map(function (file) {
        return file.uri
      })

      files.should.include(store + 'github/component-test/index/0.0.0/index.js')
      files.should.include(store + 'github/component-test/index/0.0.0/stuff.js')
      files.should.include(store + 'github/component-test/deps-pinned/0.0.0/index.js')
    })

    it('should include all css files', function () {
      files.should.include(store + 'github/component-test/index/0.0.0/index.css')
      files.should.include(store + 'github/component-test/index/0.0.0/something.css')
      files.should.include(store + 'github/component-test/deps-pinned/0.0.0/index.css')
    })
  })

  describe('component-test/deps-any', function () {
    before(clean)

    var tree
    var files

    it('should walk', co(function* () {
      var walker = Walker()
      walker.add('https://github.com/component-test/deps-any/0.0.0/index.js')
      walker.add('https://github.com/component-test/deps-any/0.0.0/index.css')
      tree = yield* walker.tree()
    }))

    it('should have downloaded component-test/index', co(function* () {
      var folder = store + 'github/component-test/index/0.0.0/'
      assert(fs.existsSync(folder + 'index.js'))
      assert(fs.existsSync(folder + 'index.css'))
      assert(fs.existsSync(folder + 'something.css'))
      assert(fs.existsSync(folder + 'stuff.js'))
    }))

    it('should have downloaded component-test/deps-any', co(function* () {
      var folder = store + 'github/component-test/deps-any/0.0.0/'
      assert(fs.existsSync(folder + 'index.js'))
      assert(fs.existsSync(folder + 'index.css'))
    }))

    it('should include all js files', function () {
      files = Walker.flatten(tree).map(function (file) {
        return file.uri
      })

      files.should.include(store + 'github/component-test/index/0.0.0/index.js')
      files.should.include(store + 'github/component-test/index/0.0.0/stuff.js')
      files.should.include(store + 'github/component-test/deps-any/0.0.0/index.js')
    })

    it('should include all css files', function () {
      files.should.include(store + 'github/component-test/index/0.0.0/index.css')
      files.should.include(store + 'github/component-test/index/0.0.0/something.css')
      files.should.include(store + 'github/component-test/deps-any/0.0.0/index.css')
    })

    it('should serialize files', function () {
      var files = serialize(tree)
      var file = files.slice(-1)[0]
      file.uri.should.equal('https://nrm.link/github/component-test/deps-any/0.0.0/index.css')
      file.source.should.equal('https://nrm.link/github/component-test/deps-any/0.0.0/index.css')
      file.hash.should.be.ok
      file.mtime.should.be.ok
      file.dependencies.should.eql([
        'https://nrm.link/github/component-test/index/0.0.0/index.css'
      ])
    })
  })
})
