
exports.store = process.env.NORMALIZE_STORE
  || process.cwd() + '/repositories/';

// note: you NEED to have this set as well as have
// your /etc/hosts file setup for this to work.
exports.hostname = process.env.NORMALIZE_HOSTNAME
  || 'normalize.us';

exports.cache = {
  maxAge: parseInt(process.env.NORMALIZE_CACHE_MAXAGE, 10)
    || 1000 * 60 * 60, // 1 hour
  max: parseInt(process.env.NORMALIZE_CACHE_MAX, 10)
    || 1024 * 1024 * 64, // 64mb
}

exports.maxAge = {
  remotes: parseInt(process.env.NORMALIZE_MAXAGE_REMOTES, 10)
    || 1000 * 60 * 60, // 1 hour
  versions: parseInt(process.env.NORMALIZE_MAXAGE_VERSIONS, 10)
    || 1000 * 60 * 60, // 1 hour
}
