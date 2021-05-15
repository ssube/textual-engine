.PHONY: build clean install run push test cover

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
	./node_modules/.bin/mocha \
		--async-only \
		--check-leaks \
		--forbid-only \
		--require esm \
		--require source-map-support \
		--recursive \
		--sort \
		"out/**/Test*.js"

cover:
	./node_modules/.bin/nyc \
		--all \
		--check-coverage \
		--exclude "out/coverage/**" \
		--exclude "test/**" \
		--reporter=text-summary \
		--reporter=html \
		--report-dir=out/coverage \
		make test