
var koa = require('koa')

var app = module.exports = koa()

app.use(require('koa-cdn'))
app.use(require('koa-favicon')())
if (app.env !== 'production') app.use(require('koa-logger')())
app.use(require('koa-compress')())

if (app.env !== 'production') app.use(require('./debug'))

app.use(require('./home'))
app.use(require('./remotes'))
app.use(require('./versions'))
app.use(require('./manifest'))
app.use(require('./file'))
