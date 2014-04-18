
var https = require('https')
var spdy = require('spdy')

module.exports = request

function* request(path, host) {
  var agent = spdy.createAgent({
    host: '127.0.0.1',
    port: request.port,
    rejectUnauthorized: false,
  })
  // note: agent may throw errors!

  var req = https.request({
    host: '127.0.0.1',
    agent: agent,
    method: 'GET',
    path: path,
    headers: {
      // too lazy to decompress in testing
      'accept-encoding': 'identity',
      'host': host || 'normalize.us',
    }
  })

  var res = yield function (done) {
    req.once('response', done.bind(null, null))
    req.once('error', done)
    req.end()
  }

  res.agent = agent
  return res
}
