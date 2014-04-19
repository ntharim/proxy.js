
var koa = require('koa')

var app = module.exports = koa()

// app.outputErrors = true

app.use(require('koa-cdn'))
app.use(require('koa-favicon')())
if (app.env !== 'production' && app.env !== 'test')
  app.use(require('koa-logger')())
app.use(require('koa-compress')())

if (app.env !== 'production')
  app.use(require('./debug'))

app.use(function* (next) {
  this.spdy = this.req.isSpdy
    && this.req.method === 'GET'
  // we may add a lot of socket listeners
  this.socket.setMaxListeners(0)

  yield* next
})

app.use(require('./home'))
app.use(require('./remotes'))
app.use(require('./versions'))
app.use(require('./manifest'))
app.use(require('./file'))

require('fs')
.readdirSync(require('path').resolve(__dirname, '../lib'))
.forEach(function (name) {
  if (name[0] === '.') return
  name = name.replace(/\.js$/, '')
  app.context[name] = require('../lib/' + name)
})
