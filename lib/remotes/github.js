
exports.domain = 'github.com';
exports.aliases = [
  'rawgit.com',
  'cdn.rawgit.com',
  'rawgithub.com',
  'api.github.com',
  'raw.github.com',
  'raw.githubusercontent.com',
];

/**
 * Download a repository to a temporary folder
 * so we can process it before moving it to `repositories/`.
 * Using curl and tar because node libraries for this suck.
 *
 * @param {String} repo
 * @param {String} version
 * @param {String} folder
 * @api private
 */

exports.download = require('github-download');

/**
 * Get all the semantically versioned tags of a repository.
 *
 * @param {String} repo
 * @return {Array} tags
 * @api private
 */

exports.versions = require('github-versions');
