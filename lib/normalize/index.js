
var fs = require('co-fs')

var component = require('./component')
var package = require('./package')

module.exports = normalize

function* normalize(path) {
  if (path.slice(-1) !== '/') path += '/'
  var has = yield {
    component: fs.exists(path + 'component.json'),
    package: fs.exists(path + 'package.json'),
    bower: fs.exists(path + 'bower.json'),
    composer: fs.exists(path + 'composer.json'),
  }

  // normalize JS
  if (has.component) {
    yield* component(path)
  } else if (has.package) {
    yield* package(path)
  } else if (has.bower) {
    /* jshint noempty:false */
  } else if (has.composer) {
    /* jshint noempty:false */
  }

  // normalize metadata
}
