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
    - [Input Module](#input-module)
    - [Local Module](#local-module)
  - [Services](#services)
    - [Input Service](#input-service)
    - [Loader Service](#loader-service)
      - [File Loader Service](#file-loader-service)
      - [Fetch Loader Service](#fetch-loader-service)
    - [Parser Service](#parser-service)
    - [Random Service](#random-service)
    - [Render Service](#render-service)
      - [Line Render Service](#line-render-service)
      - [Ink Render Service](#ink-render-service)
      - [React Render Service](#react-render-service)
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

TODO: add NLP tokenization for commands, use parts of speech

#### Common Commands

There are common verbs built into the engine for actions such as:

- `drop` an item
- `hit` an enemy
- `look` at an entity
- `move` to another room
- `take` an item
- `wait` the turn

#### Meta Commands

There are some meta commands that are handled by the state service, rather than actor scripts.

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

### Input Module

Binds:

- `BehaviorInput` to `Input` for `actorType === DEFAULT`
- `ClassicInput` to `Input` for `actorType === PLAYER`

### Local Module

Binds:

- `SeedRandom`
- `InkRender`
- `LocalScript`
- `LocalState`

## Services

### Input Service

The input service handles actor command tokenization.

TODO: rename

The name is a misnomer, left over from when the input service worked with [the render service](#render-service) to
actually read player input.

### Loader Service

The loader service handles file I/O: reading from and writing to paths.

This may wrap a remote server, accept URLs, or load from archives.

#### File Loader Service

Uses the Node `fs` module on the CLI.

#### Fetch Loader Service

TODO: Uses the `fetch` interface in a browser.

### Parser Service

The parser service parses data files loaded by the loader service.

### Random Service

The random generator service generates pseudo-random numbers.

### Render Service

The render service handles player I/O, that is, reading from and writing to the screen.

This may wrap a lower-level rendering interface and capture input events.

#### Line Render Service

Uses the Node `readline` module on the CLI.

#### Ink Render Service

Uses https://github.com/vadimdemedes/ink on the CLI.

#### React Render Service

TODO: uses https://github.com/facebook/react/ in a browser

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
