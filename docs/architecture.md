# Architecture

This guide covers the engine architecture and what role each service type plays.

## Contents

- [Architecture](#architecture)
  - [Contents](#contents)
  - [Commands](#commands)
    - [Tokenization](#tokenization)
  - [Entities](#entities)
    - [Actor Entity](#actor-entity)
    - [Item Entity](#item-entity)
    - [Room Entity](#room-entity)
  - [Modules](#modules)
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
    - [Script Scope](#script-scope)
      - [Scope Target (`this`)](#scope-target-this)
      - [Scope Data](#scope-data)
    - [Slots](#slots)
    - [Verbs](#verbs)

## Commands

TODO: explain verb and target

### Tokenization

TODO: explain classic vs natural

## Entities

### Actor Entity

TODO: explain actors

### Item Entity

TODO: explain items

### Room Entity

TODO: explain rooms

## Modules

Modules are dependency injection groups, binding a related set of services.

### Local Module

Binds:

- `ClassicInput`
- `SeedRandom`
- `LineRender`
- `LocalScript`
- `LocalState`

## Services

### Input Service

The input service handles actor command tokenization.

The name is a misnomer, left over from when the input service worked with [the render service](#render-service) to
read player input.

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

TODO: uses https://github.com/vadimdemedes/ink on the CLI

#### React Render Service

TODO: uses https://github.com/facebook/react/ in a browser

## Scripts

TODO: describe script concepts

### Script Scope

A scope is prepared whenever a script is invoked, with the target (entity upon which the script has
been invoked), any data that was provided, and various services needed to manipulate the game state.

#### Scope Target (`this`)

#### Scope Data

### Slots

Slots are named events, linked to scripts.

### Verbs

Verbs invoke a slot, with some additional data.
