
FROM ubuntu:14.04
MAINTAINER Jonathan Ong "me@jongleberry.com"

RUN apt-get update; \
    apt-get -y upgrade;

RUN apt-get install -y python g++ make curl

RUN curl http://nodejs.org/dist/v0.11.12/node-v0.11.12-linux-x64.tar.gz | \
    tar -C /usr/local/ --strip-components=1 -xvz; \
    npm update -g npm

# Auth
# ENV NORMALIZE_AUTH_GITHUB
# ENV NORMALIZE_AUTH_BITBUCKET

# ENV NORMALIZE_STORE
# ENV NORMALIZE_HOSTNAME

# File Caching
# ENV NORMALIZE_CACHE_MAXAGE
# ENV NORMALIZE_CACHE_MAX

# HTTP Cache Control
# ENV NORMALIZE_MAXAGE_REMOTES
# ENV NORMALIZE_MAXAGE_VERSIONS
# ENV NORMALIZE_MAXAGE_SEMVER
# ENV NORMALIZE_MAXAGE_FILE

# Deployment
ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080

ADD . /src

RUN cd /src; \
    npm install; \
    npm rebuild

CMD ["/src/node_modules/.bin/koa-cluster", "/src", "--cpu", "1"]
