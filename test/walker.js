
var assert = require('assert');
var rimraf = require('rimraf');
var co = require('co');
var fs = require('fs');

var Walker = require('..');

var store = Walker.config.store;

describe('Walker', function () {
  describe('component-test/index', function () {
    var tree;

    before(function (done) {
      rimraf(store, done);
    })

    it('should walk', co(function* () {
      var walker = Walker();
      walker.add('https://github.com/component-test/index/0.0.0/index.js');
      walker.add('https://github.com/component-test/index/0.0.0/index.css');
      tree = yield* walker.tree();
    }))

    it('should have downloaded the repository', co(function* () {
      var folder = store + '/github.com/component-test/index/0.0.0/';
      assert(fs.existsSync(folder + 'index.js'))
      assert(fs.existsSync(folder + 'index.css'))
      assert(fs.existsSync(folder + 'something.css'))
      assert(fs.existsSync(folder + 'stuff.js'))
    }))

    it('should have rewritten the JS dependencies', co(function* () {
      var index = tree['https://github.com/component-test/index/0.0.0/index.js'];
      index.uri.should.equal(store + 'github.com/component-test/index/0.0.0/index.js');
      index.remoteURI.should.equal('https://github.normalize.us/component-test/index/0.0.0/index.js');

      var file = index.file;
      file.string.should.not.include('module stuff from "./stuff.js";');
      file.string.should.include('module stuff from "https://github.normalize.us/component-test/index/0.0.0/stuff.js";')

      file = file.dependencies['./stuff.js'].file;
      assert.equal(file.string.trim(), 'export default \'hi\';')
    }))

    it('should have rewritten the CSS dependencies', function () {
      var index = tree['https://github.com/component-test/index/0.0.0/index.css'];
      index.uri.should.equal(store + 'github.com/component-test/index/0.0.0/index.css');
      index.remoteURI.should.equal('https://github.normalize.us/component-test/index/0.0.0/index.css');

      var file = index.file;
      file.string.should.not.include('@import "./something.css";');
      file.string.should.include('@import "https://github.normalize.us/component-test/index/0.0.0/something.css";')

      file = file.dependencies['./something.css'].file;
      assert.equal(file.string.trim(), '* {\n  box-sizing: border-box;\n}');
    })
  })
})
