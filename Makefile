BIN = ./node_modules/.bin/

test:
	@NODE_ENV=test $(BIN)mocha \
		--harmony-generators \
		--require should \
		--reporter spec \
		--timeout 30s \
		--bail \
		test/remotes.js \
		test/walker.js \
		test/app.js \
		test/normalize.js

lint:
	@$(BIN)jshint lib app

.PHONY: test lint
