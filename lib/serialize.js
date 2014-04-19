
var flatten = require('normalize-walker').flatten

var localToRemote = require('./uri').localToRemote

/**
 * Serialize a file tree into https://github.com/normalize/specifications#manifestjson.
 *
 * @param {Object} tree
 * @return {Object} manifest
 */

module.exports = function (files) {
  if (!Array.isArray(files)) files = flatten(files)
  return files.map(serialize)
}

function serialize(file) {
  return {
    uri: localToRemote(file.uri),
    source: localToRemote(file.source),
    hash: file.hash,
    mtime: file.mtime.toUTCString(),
    dependencies: Object.keys(file.dependencies).map(function (key) {
      return localToRemote(file.dependencies[key].file.uri)
    })
  }
}
