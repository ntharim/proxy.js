
var https = require('https')
var spdy = require('spdy')

module.exports = request

function* request(path) {
  var agent = spdy.createAgent({
    host: 'localhost',
    port: request.port,
  })

  var req = https.request({
    host: 'localhost',
    port: request.port,
    agent: agent,
    method: 'GET',
    path: path,
    rejectUnauthorized: false,
  })

  var res = yield function (done) {
    req.once('response', function (res) {
      done(null, res)
    })
    req.once('error', function (err) {
      console.error(err.stack)
    })
    req.end()
  }

  return res
}
