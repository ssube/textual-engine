build:
	./node_modules/.bin/tsc

run: build
	node --require esm out/index.js data/base.yml test
