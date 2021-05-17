# Textual Engine

This is a text adventure engine.

See [the getting started docs](docs/getting-started.md) for more info.

## Features

- text
- adventure
- world:
  - persistent rooms
  - wandering monsters
- engine:
  - event broadcast
  - entity scripts

## Contents

- [Textual Engine](#textual-engine)
  - [Features](#features)
  - [Contents](#contents)
  - [Building](#building)
  - [Running](#running)
  - [Docs](#docs)
  - [License](#license)

## Building

Some `make` targets are provided:

- `make build`: transpile Typescript sources
- `make test`: build and run `mocha` tests
- `make cover`: run `make test` with `nyc` code coverage

## Running

Some `make` targets are provided:

- `make run`: run with test world

## Docs

More detailed docs [are located in `./docs`](docs/).

Available documentation includes:

- [Engine Architecture](docs/architecture.md)
- [Development Workflow](docs/development.md)
- [Getting Started](docs/getting-started.md)
- [Creating Worlds](docs/worlds.md)

## License

This project uses [the MIT license](LICENSE.md).