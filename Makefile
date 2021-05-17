.PHONY: build ci clean cover graph image install push run run-debug run-image test

DOCKER_ARGS ?=
DOCKER_IMAGE := ssube/textual-engine
GIT_ARGS ?=
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
NODE_ARGS ?=
RELEASE_ARGS ?= --sign

build: node_modules
	yarn tsc

ci: build cover

clean:
	rm -rf node_modules/ out/

graph:
	cat out/debug-graph | dot -Tpng -oout/debug-graph.png && sensible-browser out/debug-graph.png

image:
	docker build $(DOCKER_ARGS) -f Dockerfile -t $(DOCKER_IMAGE) .

install:
	yarn

lint: node_modules
	yarn eslint src/ --ext .ts,.tsx

node_modules: install

out: build

push:
	git push $(GIT_ARGS) github $(GIT_BRANCH)
	git push $(GIT_ARGS) gitlab $(GIT_BRANCH)

release: node_modules
	if [[ "$(GIT_BRANCH)" != master ]]; \
	then \
		echo "Please merge to master before releasing."; \
		exit 1; \
	fi
	yarn standard-version $(RELEASE_ARGS)
	GIT_ARGS=--follow-tags $(MAKE) push

run: build
	node $(NODE_ARGS) --require esm out/src/index.js data/config.yml data/base.yml test test

run-debug:
	NODE_ARGS=--inspect-brk $(MAKE) run

run-image: image
	docker run --rm -it $(DOCKER_IMAGE):latest data/config.yml data/base.yml test test

MOCHA_ARGS := --async-only \
	--check-leaks \
	--forbid-only \
	--require esm \
	--require source-map-support \
	--require out/test/setup.js \
	--recursive \
	--sort

test: node_modules out
	yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"

NYC_ARGS := --all \
	--check-coverage \
	--exclude ".eslintrc.js" \
	--exclude "out/coverage/**" \
	--exclude "test/**" \
	--reporter=text-summary \
	--reporter=html \
	--report-dir=out/coverage

cover: node_modules out
	yarn nyc $(NYC_ARGS) yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"
