
exports.store = process.env.NORMALIZE_STORE
  || process.cwd() + '/repositories/';

// note: you NEED to have this set as well as have
// your /etc/hosts file setup for this to work.
exports.hostname = process.env.NORMALIZE_HOSTNAME
  || 'normalize.us';

exports.cache = {
  maxAge: parseInt(process.env.CACHE_MAXAGE, 10)
    || 1000 * 60 * 60, // 1hour
  max: parseInt(process.env.CACHE_MAX, 10)
    || 1024 * 1024 * 64, // 64mb
}