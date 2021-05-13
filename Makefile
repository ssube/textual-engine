build: install
	./node_modules/.bin/tsc

clean:
	rm -rf node_modules/ out/

install:
	yarn

run: build
	node --require esm out/index.js data/base.yml test

push:
	git push github $(shell git rev-parse --abbrev-ref HEAD)
