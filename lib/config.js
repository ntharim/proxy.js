
exports.store = process.env.NORMALIZE_STORE
  || process.cwd() + '/repositories/';

// note: you NEED to have this set as well as have
// your /etc/hosts file setup for this to work.
exports.hostname = process.env.NORMALIZE_HOSTNAME
  || 'normalize.us';
