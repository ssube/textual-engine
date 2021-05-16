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

TODO: install and build

### Testing

TODO: testing and coverage

### Running

TODO: run and play

### Debugging

TODO: debug/graph
TODO: inspector/break

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
