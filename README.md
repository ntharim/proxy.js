
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

## License

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
