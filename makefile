install:
	npm i
	npm link @falcon.io/cli

build: 
	tsc

link: build
	npm link
