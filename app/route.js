
var route = module.exports = require('path-match')({
  strict: true
})

route.project = '/:remote([\\w-.]+)'
  + '/:user([\\w-]+)'
  + '/:project([\\w-.]+)'
