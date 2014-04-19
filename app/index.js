
var koa = require('koa')

var remotes = require('../lib/remotes')

var app = module.exports = koa()

// app.outputErrors = true

app.use(require('koa-cdn'))
app.use(require('koa-favicon')())
if (app.env !== 'production' && app.env !== 'test')
  app.use(require('koa-logger')())
app.use(require('koa-compress')())

if (app.env !== 'production')
  app.use(require('./debug'))

app.use(require('./home'))
app.use(require('./remotes'))
app.use(require('./versions'))
app.use(require('./manifest'))
app.use(require('./file'))

Object.defineProperties(app.context, {
  // get the absolute URL of this path
  uri: {
    get: function () {
      if ('_uri' in this) return this._uri
      return this._uri = 'https://'
        + this.request.host
        + this.request.path
    }
  },

  // whether to use spdy
  spdy: {
    get: function () {
      if ('_spdy' in this) return this._spdy
      return this._spdy = this.req.isSpdy
        && this.req.method === 'GET'
    }
  },

  // get the current remote based on hostname
  remote: {
    get: function () {
      if ('_remote' in this) return this._remote
      this._remote = remotes(this.request.host)
      if (!this._remote) this.throw(404, 'Unknown hostname.')
      return this._remote
    }
  }
})
