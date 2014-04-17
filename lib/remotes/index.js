
var config = require('../../config');

require('fs').readdirSync(__dirname).forEach(function (name) {
  if (name[0] === '.') return;
  if (name === 'index.js') return;
  remotes[name.replace('.js', '')] = require('./' + name);
})

module.exports = remotes;

/**
 * Look up a remote by a hostname or a name.
 *
 * @param {String} hostname
 * @return {Object} remote
 * @api public
 */

function remotes(hostname) {
  for (var i = 0; i < names.length; i++) {
    var name = names[i]
    var remote = remotes[name]
    if (name === hostname) return remote
    if (~remote.aliases.indexOf(hostname)) return remote
  }
}

var names = Object.keys(remotes);

names.forEach(function (name) {
  var remote = remotes[name]
  var aliases = remote.aliases
  remote.name = name
  remote.hostname = name + '.' + config.hostname
  if (!~aliases.indexOf(remote.domain)) aliases.push(remote.domain)
  if (!~aliases.indexOf(remote.hostname)) aliases.push(remote.hostname)
})
