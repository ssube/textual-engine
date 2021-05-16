.PHONY: build clean cover graph install push run test

GIT_ARGS ?=
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
RELEASE_ARGS ?= --release-as patch --sign

build: install
	./node_modules/.bin/tsc

clean:
	rm -rf node_modules/ out/

graph:
	cat out/debug-graph | dot -Tpng -oout/debug-graph.png && sensible-browser out/debug-graph.png

install:
	yarn

push:
	git push $(GIT_ARGS) github $(GIT_BRANCH)
	git push $(GIT_ARGS) gitlab $(GIT_BRANCH)

release:
	if [[ "$(GIT_BRANCH)" != master ]]; \
	then \
		echo "Please merge to master before releasing."; \
		exit 1; \
	fi
	./node_modules/.bin/standard-version $(RELEASE_ARGS)
	GIT_ARGS=--follow-tags $(MAKE) push

run: build
	node --require esm out/src/index.js data/config.yml data/base.yml test test

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