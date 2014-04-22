
require('fs').readdirSync(__dirname).forEach(function (name) {
  if (name[0] === '.') return
  if (name === 'index.js') return
  exports[name.replace(/\.js$/, '')] = require('./' + name)
})
