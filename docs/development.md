# Development

This guide covers the development patterns and workflow, or how to build and test the engine.

## Contents

- [Development](#development)
  - [Contents](#contents)
  - [Workflow](#workflow)
    - [Building](#building)
    - [Testing](#testing)
    - [Running](#running)
    - [Debugging](#debugging)
  - [Patterns](#patterns)

## Workflow

### Building

Code is written in Typescript, built with `make`, and runs in Node 12+.

Run `make build` to compile into `out/`.

### Testing

Tests are written using Mocha, with Chai assertions and Sinon mocks/stubs/spies.

Run `make test` to run tests (Mocha by itself). Run `make cover` to run tests under `nyc`,
and collect coverage reports into [`out/coverage/lcov-report/index.html`](../out/coverage/lcov-report/index.html).

### Running

The engine can be run from `make` or `docker` with the demo data.

Run `make run` to run the game normally. Run `make run-image` to run the latest docker image (may pull the image).

### Debugging

The engine has a few builtin debug commands, which can be run from within the game:

- `debug` will print the current world state tree to output
- `graph [path]` will print the current world state tree to a graphviz file

Run `graph out/debug-graph` in the game, then `make graph` normally to render the world tree.

Run `make debug` to run the engine and wait for a Chrome inspector to be attached.

## Patterns

- sort imports
  - modules
  - `../`
  - `./`
- sort declarations
  - types
  - interfaces (types and interfaces may need to be mixed)
  - classes
  - functions (avoid defining classes and loose functions in the same file)
  - constants
- visibility
  - prefer protected
  - most methods should be public for testing
  - private is a smell
- syntax
  - do not use unary negation: `if (!foo)`
    - it is hard to read/easy to miss
    - prefer type guards and positive assertions, they read better: `if (doesExist(foo))`
  - do not use `else if`, avoid `else`
    - `else if` should be a map lookup or switch, depending on the number of branches and whether it is dynamic
    - prefer early exit, it works better in async flows
- iteration
  - prefer [tacit programming](https://en.wikipedia.org/wiki/Tacit_programming) for predicate loops
    - `items.map(doesExist)` has all of the same semantic meaning (and less syntactic overhead) as `items.map((it) => doesExist)`
    - write composable functions with this in mind (not everything needs to be a method)
- models
  - models should be POJSOs (Array, Map, and Set are still allowed)
  - significant logic should live in a repository service (like the `StateService` does for game state)
- build
  - bundling matters, never ship raw `node_modules` (for both inode counts and output size, tree-shaking)
  - hot module reloading never works reliably, don't bother
- collections
  - prefer `Map` over `Record` when keys are dynamic or iteration is needed
- operators
  - use `===`: `==` too often requires an accompanying typeguard, and types should already be predictable, so
    coercion should not occur
