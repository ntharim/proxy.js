
# Normalize Proxy

Install a remote repository locally to be served via SPDY Push.

## Requirements

Each repository must:

- Have `index.js`, `index.css`, and/or `index.html` entry points
- JS must be ES6 or CommonJS modules
- All remote dependencies must be of the form `https://<host>/<user>/<repo>/<version>/index.<format>`
- All relative/local dependencies must begin with a `.` or not begin with a `/` or protocol (i.e. like HTML/CSS, but not like CommonJS).

If the repository does not have any of the above entry points or does not satisfy any of these tests,
then the installation will fail.
Some normalization repositories will be added to make `component.json`, `bower.json`, and `npm.json` packages conform to these specifications automatically.

## Platform

This server is designed to run on UNIX systems and is thus able to avoid many issues and code bloat.
Since this proxy is __not__ designed to be run on clients, there's no need to support Windows.
However, a `Dockerfile` will be included to make it easy for you to setup a proxy in a VM.
