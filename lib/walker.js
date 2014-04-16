
var Walker = require('normalize-walker');

var plugins = require('./plugins');
var utils = require('./utils');

var Dependency = Walker.dependency;

module.exports = Walk;

Walk.clear = function () {
  Walk.cache = Object.create(null);
  return Walk;
}
Walk.clear();

/**
 * Create a custom walker instance which includes our own middleware.
 */

function Walk(options) {
  options = options || {};
  options.cache = Walk.cache;

  var walker = Walker();
  walker.add = add;

  // all the plugins
  walker.use(plugins.resolveDependency(options));
  walker.use(Walker.plugins.text(options));
  walker.use(Walker.plugins.json(options));
  walker.use(Walker.plugins.css(options));
  walker.use(Walker.plugins.js(options));
  walker.use(Walker.plugins.file(options));
  walker.use(plugins.rewriteCSSDependencies(options));
  walker.use(plugins.rewriteJSDependencies(options));

  return walker;
}

function add(uri) {
  var dependency = new Dependency(utils.remoteToLocalPath(uri));
  dependency.remoteURI = uri;
  this.dependencies[uri] = dependency;
  return this;
}
