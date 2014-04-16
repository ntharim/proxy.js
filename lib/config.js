
exports.store = (process.env.COMPONENT_STORE || process.cwd())
  + '/components/';

// note: you NEED to have this set as well as have
// your /etc/hosts file setup for this to work.
exports.hostname = process.env.COMPONENT_HOSTNAME
  || 'component.io';
