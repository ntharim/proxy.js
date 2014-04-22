
var Walker = require('normalize-walker')

var plugins = require('./plugins')
var config = require('../config')
var uris = require('./uri')

var Dependency = Walker.dependency

module.exports = Walk

Walk.flatten = Walker.flatten

// global cache
Walk.cache = require('lru-cache')({
  maxAge: config.cache.maxAge,
  max: config.cache.maxAge,
  length: function (file) {
    // if for some reason the .length is not set,
    // we assume it's 1kb
    return file.length || 1
  }
})

// list of plugins to use
Walk.plugins = [
  Walker.plugins.logs,
  plugins.resolve,
  Walker.plugins.text,
  Walker.plugins.json,
  Walker.plugins.css,
  Walker.plugins.js,
  Walker.plugins.file,
  Walker.plugins.absolute,
  plugins.rewrite.css,
  plugins.rewrite.js,
]

/**
 * Create a custom walker instance which includes our own middleware.
 */

function Walk(options) {
  options = options || {}
  options.cache = Walk.cache

  var walker = Walker()

  walker.add = add

  Walk.plugins.forEach(function (plugin) {
    walker.use(plugin(options))
  })

  return walker
}

/**
 * We need to rejigger this a little bit to make everything local.
 */

function add(uri) {
  var dependency = new Dependency(uris.remoteToLocal(uri))
  dependency.remoteURI = uri
  this.dependencies[uri] = dependency
  return this
}
