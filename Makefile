.PHONY: build clean cover graph node_modules push run run-debug run-image test

DOCKER_ARGS ?=
DOCKER_IMAGE := ssube/textual-engine
GIT_ARGS ?=
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
NODE_ARGS ?=
RELEASE_ARGS ?= --sign

build: node_modules
	./node_modules/.bin/tsc

clean:
	rm -rf node_modules/ out/

graph:
	cat out/debug-graph | dot -Tpng -oout/debug-graph.png && sensible-browser out/debug-graph.png

image:
	docker build $(DOCKER_ARGS) -f Dockerfile -t $(DOCKER_IMAGE) .

node_modules:
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
	node $(NODE_ARGS) --require esm out/src/index.js data/config.yml data/base.yml test test

run-debug:
	NODE_ARGS=--inspect-brk $(MAKE) run

run-image: image
	docker run --rm -it $(DOCKER_IMAGE):latest data/config.yml data/base.yml test test

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
