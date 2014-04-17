
var config = require('../config');

require('fs').readdirSync(__dirname).forEach(function (name) {
  if (name[0] === '.') return;
  if (name === 'index.js') return;
  remotes[name.replace('.js', '')] = require('./' + name);
})

module.exports = remotes;

/**
 * Look up a remote by a hostname.
 *
 * @param {String} hostname
 * @return {Object} remote
 * @api public
 */

function remotes(hostname) {
  for (var i = 0; i < names.length; i++) {
    var remote = remotes[names[i]];
    if (~remote.aliases.indexOf(hostname)) return remote;
  }
}

var names = Object.keys(remotes);

names.forEach(function (name) {
  var remote = remotes[name];
  remote.name = name;
  remote.hostname = name + '.' + config.hostname;
  remote.aliases.push(remote.domain, remote.hostname);
})
