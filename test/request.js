
var https = require('https')
var spdy = require('spdy')

module.exports = request

function* request(path) {
  var res
  var agent = spdy.createAgent({
    host: '127.0.0.1',
    port: request.port,
    rejectUnauthorized: false,
  })
  // note: agent may throw errors!

  // we need to add a listener to the `push` event
  // otherwise the agent will just destroy all the push streams
  var streams = []
  agent.on('push', function (stream) {
    if (res) res.emit('push', stream)
    streams.push(stream)
  })

  var req = https.request({
    host: '127.0.0.1',
    agent: agent,
    method: 'GET',
    path: path,
    headers: {
      // too lazy to decompress in testing
      'accept-encoding': 'identity',
    }
  })

  res = yield function (done) {
    req.once('response', done.bind(null, null))
    req.once('error', done)
    req.end()
  }

  res.streams = streams
  res.agent = agent

  return res
}
