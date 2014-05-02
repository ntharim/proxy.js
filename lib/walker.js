
var Walker = require('normalize-walker')
var transforms = require('normalize-transforms')
var Dependency = require('normalize-walker/lib/dependency')

var plugins = require('./plugins')
var config = require('../config')
var uris = require('./uri')

module.exports = Walk

Walk.flatten = Walker.flatten

// global cache
Walk.cache = require('lru-cache')({
  maxAge: config.cache.maxAge,
  max: config.cache.max,
  length: function (file) {
    // if for some reason the .length is not set,
    // we assume it's 1kb
    return file.length || 1
  }
})

// list of plugins to use
Walk.plugins = [
  Walker.plugins.logs(),
  plugins.resolve(),
  plugins.rewrite.css(),
  plugins.rewrite.js(),
  transforms(),
]

/**
 * Create a custom walker instance which includes our own middleware.
 */

function Walk() {
  var walker = Walker({
    cache: Walk.cache
  })

  walker.add = add

  Walk.plugins.forEach(function (plugin) {
    walker.use(plugin)
  })

  return walker
}

/**
 * We need to rejigger this a little bit to make everything local.
 */

function add(uri) {
  var dependency = new Dependency(uris.remoteToLocal(uri))
  dependency.remote = uri
  this.dependencies[uri] = dependency
  return this
}
