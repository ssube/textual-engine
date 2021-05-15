.PHONY: build clean install run push test

build: install
	./node_modules/.bin/tsc

clean:
	rm -rf node_modules/ out/

install:
	yarn

run: build
	node --require esm out/src/index.js data/base.yml test test

push:
	git push github $(shell git rev-parse --abbrev-ref HEAD)

test: build
	./node_modules/.bin/mocha --require esm --recursive --sort "out/**/Test*.js"