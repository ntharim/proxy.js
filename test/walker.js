
var assert = require('assert')
var rimraf = require('rimraf')
var co = require('co')
var fs = require('fs')

var Walker = require('../lib/walker')
var store = require('../config').store

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

    it('should not have rewritten any dependencies', co(function* () {
      var string = tree['https://github.com/component-test/remotes/0.0.0/index.js'].file.string
      string.should.include('//something.com/really/stupid.js')
      string.should.include('http://something.com/else/stupid.js')
      string.should.include('https://asdf.com/lkjasdf.js')
      string.should.include('/kljalksjdf/asdfasdf.js')
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
      index.remote.should.equal('https://nlz.io/github/component-test/index/0.0.0/index.js')

      var file = index.file
      file.string.should.not.include("'./stuff.js'")
      file.string.should.include('https://nlz.io/github/component-test/index/0.0.0/stuff.js')

      file = file.dependencies['./stuff.js'].file
      file.string.should.not.include('export default')
    }))

    it('should have rewritten the CSS dependencies', function () {
      var index = tree['https://github.com/component-test/index/0.0.0/index.css']
      index.uri.should.equal(store + 'github/component-test/index/0.0.0/index.css')
      index.remote.should.equal('https://nlz.io/github/component-test/index/0.0.0/index.css')

      var file = index.file
      file.string.should.not.include('@import "./something.css"')
      file.string.should.include('@import "https://nlz.io/github/component-test/index/0.0.0/something.css"')

      file = file.dependencies['./something.css'].file
      file.string.should.include('box-sizing: border-box')
      file.string.should.include('-moz-box-sizing')
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
  })
})
