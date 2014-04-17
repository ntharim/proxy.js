
var spdy = require('spdy')

var app = require('../app')

var options = {
  key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
  cert: fs.readFileSync(__dirname + '/keys/spdy-cert.pem'),
  ca: fs.readFileSync(__dirname + '/keys/spdy-csr.pem'),
}

var server =
module.exports = spdy.createServer(options, app.callback())

if (!module.exports) server.listen(process.env.PORT)