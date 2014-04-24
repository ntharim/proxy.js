
/**
 * Note: this file is for development use ONLY!!!
 */

var spdy = require('spdy')
var keys = require('spdy-keys')
keys.rejectUnauthorized = false

var app = require('./')

var server =
module.exports = spdy.createServer(keys, app.callback())

if (!module.parent) {
  server.listen(process.env.PORT, function (err) {
    if (err) throw err
    console.log('normalization proxy listening on port ' + this.address().port)
  })
}
