# Architecture

This guide covers the engine architecture and what role each service type plays.

## Contents

- [Architecture](#architecture)
  - [Contents](#contents)
  - [Commands](#commands)
    - [Command Tokenization](#command-tokenization)
      - [Common Commands](#common-commands)
      - [Meta Commands](#meta-commands)
      - [Verb Commands](#verb-commands)
  - [Entities](#entities)
    - [Actor Entity](#actor-entity)
    - [Item Entity](#item-entity)
    - [Room Entity](#room-entity)
  - [Modules](#modules)
    - [Browser Module](#browser-module)
    - [Core Module](#core-module)
    - [Node Module](#node-module)
  - [Services](#services)
    - [Actor Service](#actor-service)
    - [Loader Service](#loader-service)
      - [Browser Fetch Loader Service](#browser-fetch-loader-service)
      - [Browser Page Loader Service](#browser-page-loader-service)
      - [Node Fetch Loader Service](#node-fetch-loader-service)
      - [Node File Loader Service](#node-file-loader-service)
    - [Parser Service](#parser-service)
    - [Random Service](#random-service)
    - [Render Service](#render-service)
      - [Line Render Service](#line-render-service)
      - [Ink Render Service](#ink-render-service)
      - [React DOM Render Service](#react-dom-render-service)
    - [Script Service](#script-service)
    - [State Service](#state-service)
      - [Local State](#local-state)
    - [Tokenizer Service](#tokenizer-service)
      - [Natural Tokenizer](#natural-tokenizer)
      - [Word Tokenizer](#word-tokenizer)
  - [Scripts](#scripts)
    - [Script Context](#script-context)
      - [Script Target (`this`)](#script-target-this)
      - [Scope Data](#scope-data)
    - [Slots](#slots)
    - [Verbs](#verbs)

## Commands

The player's input lines are parsed into commands for the actor to execute. NPC AI generates input commands directly.

### Command Tokenization

Commands are built by splitting input on whitespace, removing articles (a, an, the, etc) and other filler words, and
assuming the verb and target are in the correct order. Some validation is done when invoking commands, but the parsing
is very simple.

#### Common Commands

There are common verbs built into the engine for actions such as:

- `drop` an item
- `hit` an enemy
- `look` at an entity
- `move` to another room
- `take` an item
- `use` an item
- `wait` the turn

#### Meta Commands

There are some meta commands that are handled by the state service, rather than actor scripts.

- `create`
  - create a new world from the template
- `debug`
  - print the world state to output
- `graph`
  - print the world state to path in graphviz format
- `help`
  - list common and meta commands
- `load`
  - load the world state from a path
- `save`
  - save the world state to a path
- `quit`

#### Verb Commands

World entities may define their own verbs, which can be invoked normally through input.

## Entities

### Actor Entity

TODO: explain actors

### Item Entity

TODO: explain items

### Room Entity

TODO: explain rooms

## Modules

Modules are dependency injection groups, binding a related set of services.

### Browser Module

Provides:

- `browser-fetch-loader`
- `browser-page-loader`
- `browser-dom-render`

### Core Module

Binds:

- `LocalCounter`
- `NodeEventBus`
- `NextLocale`
- `YamlParser`
- `SeedRandom`
- `LocalScript`
- `ChainTemplate`
- `WordTokenizer`

Provides:

- `core-behavior-actor`
- `core-player-actor`
- `core-local-state`

### Node Module

Provides:

- `node-file-loader`
- `node-fetch-loader`
- `node-ink-render`
- `node-line-render`

## Services

### Actor Service

The actor service handles actor command tokenization and output translation.

### Loader Service

The loader service handles file I/O: reading from and writing to paths.

This may wrap a remote server, accept URLs, or load from archives.

#### Browser Fetch Loader Service

Uses the `fetch` interface in a browser.

Protocols:

- `https`
- `http`: use `https` whenever possible

#### Browser Page Loader Service

Loads from elements on the page.

Protocols:

- `page`

#### Node Fetch Loader Service

Uses the `fetch` interface on the CLI via [`node-fetch`](https://www.npmjs.com/package/node-fetch).

Protocols:

- `https`
- `http`: use `https` whenever possible

#### Node File Loader Service

Uses the Node `fs` module on the CLI.

Protocols:

- `file`

### Parser Service

The parser service parses data files loaded by the loader service.

### Random Service

The random generator service generates pseudo-random numbers.

### Render Service

The render service handles player I/O, that is, reading from and writing to the screen.

This may wrap a lower-level rendering interface and capture input events.

#### Line Render Service

Uses [the Node `readline` module](https://nodejs.org/api/readline.html) on the CLI to draw a basic line-based interface.

#### Ink Render Service

Uses [the Ink library](https://github.com/vadimdemedes/ink) on the CLI to draw a responsive text interface.

#### React DOM Render Service

Uses [the React library](https://github.com/facebook/react/) in the browser to draw an HTML interface.

### Script Service

The script service invokes command scripts on behalf of world entities.

### State Service

The state service manages world state, creating it from templates and stepping it each turn.

#### Local State

Step state in-memory.

### Tokenizer Service

#### Natural Tokenizer

**Not implemented yet.**

Use natural language processing to tag parts of speech and build a command.

#### Word Tokenizer

Simple positional arguments, split on whitespace and with articles removed.

The first word is the verb, and the last word is considered an index, if it is numeric.

For example:

```none
move west
hit goblin 2
```

## Scripts

Events in the world are processed by scripts attached to the entity performing the action. Scripts may be
invoked on a single target entity or broadcast to an entire room, and take a context with field for some (optional)
primitive data.

### Script Context

A context is prepared whenever a script is invoked, with the target (entity upon which the script has
been invoked), any data that was provided, and some helpers that provide safe ways to mutate the game state.

#### Script Target (`this`)

The entity on which the script is being invoked. Always a world entity.

#### Scope Data

The context contains a data field, suitable for passing in non-nested numbers and strings.

TODO: support custom template data for scripts

### Slots

Slots are named events on an entity, linked to (named) scripts.

### Verbs

Verbs are custom commands, which invoke a slot with some additional data.
