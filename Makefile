.PHONY: build ci clean cover graph image install push run run-debug run-image test

DOCKER_ARGS ?=
DOCKER_IMAGE := ssube/textual-engine
GIT_ARGS ?=
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
NODE_ARGS ?=
RELEASE_ARGS ?= --sign

build: ## build the app
build: node_modules
	yarn tsc

ci: build cover

clean:
	rm -rf node_modules/ out/

graph: ## render any debug graphs
	cat out/debug-graph | dot -Tpng -oout/debug-graph.png && sensible-browser out/debug-graph.png

image: ## build the docker image
	docker build $(DOCKER_ARGS) -f Dockerfile -t $(DOCKER_IMAGE) .

install:
	yarn

lint: ## run eslint
lint: node_modules
	yarn eslint src/ --ext .ts,.tsx

node_modules: install

out: build

push: ## push to both github and gitlab
	git push $(GIT_ARGS) github $(GIT_BRANCH)
	git push $(GIT_ARGS) gitlab $(GIT_BRANCH)

release: ## tag and push a release
release: node_modules
	if [[ "$(GIT_BRANCH)" != master ]]; \
	then \
		echo "Please merge to master before releasing."; \
		exit 1; \
	fi
	yarn standard-version $(RELEASE_ARGS)
	GIT_ARGS=--follow-tags $(MAKE) push

run: ## run app with demo data
run: build
	node $(NODE_ARGS) --require esm out/src/index.js data/config.yml data/base.yml test test

run-debug: ## run app and wait for debugger
	NODE_ARGS=--inspect-brk $(MAKE) run

run-image: ## run app from docker image
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

test: ## run tests
test: node_modules out
	yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"

NYC_ARGS := --all \
	--check-coverage \
	--exclude ".eslintrc.js" \
	--exclude "out/coverage/**" \
	--exclude "test/**" \
	--reporter=text-summary \
	--reporter=lcov \
	--report-dir=out/coverage

cover: ## run tests with coverage
cover: node_modules out
	yarn nyc $(NYC_ARGS) yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"

# from https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## print this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort \
		| sed 's/^.*\/\(.*\)/\1/' \
		| awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

todo:
	@echo "Remaining tasks:"
	@echo ""
	@grep -i "todo" -r docs/ src/ test/ || true
	@echo ""
	@echo "Pending tests:"
	@echo ""
	@grep "[[:space:]]xit" -r test/ || true
	@echo ""
	@echo "Casts to any:"
	@echo ""
	@grep "as any" -r src/ test/ || true
	@echo ""
	@echo "Uses of null:"
	@echo ""
	@grep "null" -r src/ test/ || true
	@echo ""
	@echo "Uses of ==:"
	@echo ""
	@grep -e "[^=!]==[^=]" -r src/ test/ || true
	@echo ""

# from https://gist.github.com/amitchhajer/4461043#gistcomment-2349917
git-stats: ## print git contributor line counts (approx, for fun)
	git ls-files | while read f; do git blame -w -M -C -C --line-porcelain "$$f" |\
		grep -I '^author '; done | sort -f | uniq -ic | sort -n

upload-climate:
	cc-test-reporter format-coverage -t lcov -o out/coverage/codeclimate.json -p . out/coverage/lcov.info
	cc-test-reporter upload-coverage --debug -i out/coverage/codeclimate.json -r "$(shell echo "${CODECLIMATE_SECRET}" | base64 -d)"
