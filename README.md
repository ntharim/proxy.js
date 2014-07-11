
# Normalize Proxy

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]

[npm-image]: https://img.shields.io/npm/v/normalize-proxy.svg?style=flat
[npm-url]: https://npmjs.org/package/normalize-proxy
[travis-image]: https://img.shields.io/travis/normalize/proxy.js.svg?style=flat
[travis-url]: https://travis-ci.org/normalize/proxy.js
[coveralls-image]: https://img.shields.io/coveralls/normalize/proxy.js.svg?style=flat
[coveralls-url]: https://coveralls.io/r/normalize/proxy.js?branch=master
[gittip-image]: https://img.shields.io/gittip/jonathanong.svg?style=flat
[gittip-url]: https://www.gittip.com/jonathanong/

Install a remote repository locally to be served via SPDY Push.

## Setting Up

You'll notice a `Dockerfile` located at the root of this repository.
With docker, you should be able to go through the following steps to run the proxy (not yet tested as of v0.1.0):

```bash
git clone git://github.com/normalize/proxy.js
cd proxy.js
vim Dockerfile # change all the environmental variables
# maybe add your own .npmrc file
sudo docker build -t myname/normalize-proxy .
docker run -p 8080:8080 -d myname/normalize-proxy
```

If this doesn't work, please let me know!

If you're on a UNIX platform,
you don't need to use Docker!
Just look at the `Dockerfile` and set the same environmental variable.
After that, running `npm start` should work:

```bash
git clone git://github.com/normalize/proxy.js
cd proxy.js
npm i
export PORT=8888
npm start
```

## Private Repositories

To access private repositories,
you must either add authentication environmental variables or add files.

- GitHub - set the `NORMALIZE_AUTH_GITHUB` env var for basic auth.
  It should be of the form `<username>:<token>`.
  You should use [GitHub OAuth Tokens](https://developer.github.com/v3/auth/#via-oauth-tokens).
- NPM - having a `.npmrc` file should be sufficient.
  For docker, you should add it to the image.
  This is untested - please let me know if it works.

## Platform

This server is designed to run on UNIX systems and is thus able to avoid many issues and code bloat.
Since this proxy is __not__ designed to be run on clients, there's no need to support Windows.
However, a `Dockerfile` will be included to make it easy for you to setup a proxy in a VM.
