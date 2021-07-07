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
  - do not compare with `true`
    - `x === false` is a positive assertion (value *is* false)
    - `x === true` is usually only necessary when `x` might not be a boolean
- iteration
  - prefer assertions for loop predicates
    - `items.map(doesExist)` has all of the same semantic meaning (and less syntactic overhead) as `items.map((it) => doesExist)`
    - write composable functions with this in mind (not everything needs to be a method)
  - JS and TS can do a [limited form of point-free programming](https://www.freecodecamp.org/news/how-point-free-composition-will-make-you-a-better-functional-programmer-33dcb910303a/) with semantic assertions and typeguards
    - see [tacit programming](https://en.wikipedia.org/wiki/Tacit_programming) for more details
- models
  - models should be POJSOs (Array, Map, and Set are still allowed)
  - significant logic should live in a repository service (like the `StateService` does for game state)
- build
  - bundling matters, never ship raw `node_modules` (for both inode counts and output size, tree-shaking)
  - hot module reloading never works reliably, don't bother
- collections
  - prefer `Map` over `Record` when keys are dynamic or iteration is needed
- comparison
  - always use strict boolean comparison
    - prevents coercive comparison
  - prefer semantic assertions over values (limited point-free style)
- operators
  - do not use `==`, prefer `===`
    - `==` too often requires an accompanying typeguard or defensive code
    - use narrow types and compare them narrowly
- null and undefined
  - do not use `null`, prefer `undefined`
  - Javascript (and by extension Typescript) has an inconsistent understanding of undefined values, with
    keywords for explicit non-existance (`null`) and implicit non-existence (`undefined`), in part due to
    the lack of `Some` and `None` types in the language
  - while `null` can be seen as explicit non-existence, it is effectively impossible to avoid `undefined` while using
    JS, and using both is the most problematic option
  - the Ajv schemas can fail on missing values or insert default values during validation, ensuring models are
    populated and reducing defensive code
  - the `@apextoaster/js-utils` library exports a number of assertive typeguards to remove null/undefined values
- coverage
  - coverage is a way of identifying unreachable and unused code
  - 100% code coverage is not a goal, it is a side effect of removing dead code
  - all new code should be fully tested
  - once tests have been written for all expected behaviors, any uncovered code can be removed
    - it is not needed to satisfy the requirements
- assertions
  - prefer semantic assertions over value comparison: `isNil(x)` over `x === null || x === undefined`
    - the assertion function can:
      - have a doc comment
      - be a type guard for a user-defined type
  - prefer positive assertions: `isNil(x)` is better than `notDefined(x)`
    - positive assertions usually have a finite result set, and describe the values that are present
    - negative assertions only describe the values that are not present, which are no longer interesting
  - prefer semantic assertions over asserting or coalescing operators
    - prefer `mustExist(x).y` over `x!.y`
    - a typed error with message can describe what was missing and what was expected, unlike a `TypeError`
    - this is a combination of the early-return, no-null, and typed-error patterns
- tests
  - new code should have full coverage
  - new code must not reduce overall coverage
  - modified code should have full coverage
  - regression tests should be added for every `type/bug` ticket
    - the test name or doc comment should have the ticket # or link
    - these should usually be written against the broken version, then run against both broken and fixed versions
