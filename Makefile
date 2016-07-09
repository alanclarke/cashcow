.PHONY: test

BIN = node_modules/.bin

test:
	$(BIN)/karma start --single-run
	$(BIN)/istanbul cover $(BIN)/_mocha test/test*
	$(BIN)/standard
