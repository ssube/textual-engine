# Services

This guide describes what each service does.

## Contents

- [Services](#services)
  - [Contents](#contents)
  - [Actor Service](#actor-service)
    - [Behavior Actor](#behavior-actor)
    - [Player Actor](#player-actor)
  - [Counter Service](#counter-service)
    - [Local Counter](#local-counter)
  - [Event Service](#event-service)
    - [Node Event Bus](#node-event-bus)
  - [Loader Service](#loader-service)
    - [Browser Fetch Loader Service](#browser-fetch-loader-service)
    - [Browser Page Loader Service](#browser-page-loader-service)
    - [Node Fetch Loader Service](#node-fetch-loader-service)
    - [Node File Loader Service](#node-file-loader-service)
  - [Locale Service](#locale-service)
    - [Next Locale](#next-locale)
  - [Parser Service](#parser-service)
    - [YAML Parser](#yaml-parser)
  - [Random Service](#random-service)
    - [Alea Random](#alea-random)
    - [Math Random](#math-random)
  - [Render Service](#render-service)
    - [Browser DOM Render Service](#browser-dom-render-service)
    - [Node Line Render Service](#node-line-render-service)
    - [Node Ink Render Service](#node-ink-render-service)
  - [Script Service](#script-service)
    - [Local Script](#local-script)
  - [State Service](#state-service)
    - [Local State](#local-state)
  - [Template Service](#template-service)
    - [Chain Template](#chain-template)
  - [Tokenizer Service](#tokenizer-service)
    - [Natural Tokenizer](#natural-tokenizer)
    - [Word Tokenizer](#word-tokenizer)

## Actor Service

The actor service handles actor command tokenization and output translation.

### Behavior Actor

Batch handling of NPCs.

### Player Actor

Singular player client.

## Counter Service

Provide unique IDs.

### Local Counter

In-memory incrementing integer counter.

## Event Service

Ship events between services.

### Node Event Bus

Uses Node's EventEmitter or polyfill.

## Loader Service

The loader service handles file I/O: reading from and writing to paths.

This may wrap a remote server, accept URLs, or load from archives.

### Browser Fetch Loader Service

Uses the `fetch` interface in a browser.

Protocols:

- `https`
- `http`: use `https` whenever possible

### Browser Page Loader Service

Loads from elements on the page.

Protocols:

- `page`

### Node Fetch Loader Service

Uses the `fetch` interface on the CLI via [`node-fetch`](https://www.npmjs.com/package/node-fetch).

Protocols:

- `https`
- `http`: use `https` whenever possible

### Node File Loader Service

Uses the Node `fs` module on the CLI.

Protocols:

- `file`

## Locale Service

Provides translations.

### Next Locale

Based on i18next.

## Parser Service

The parser service parses data files loaded by the loader service.

### YAML Parser

js-yaml based with extended types.

## Random Service

The random generator service generates pseudo-random numbers.

### Alea Random

seedrandom-based Alea generator.

### Math Random

Not very random and not recommended for gameplay, good for testing.

## Render Service

The render service handles player I/O, that is, reading from and writing to the screen.

This may wrap a lower-level rendering interface and capture input events.

### Browser DOM Render Service

Uses [the React library](https://github.com/facebook/react/) in the browser to draw an HTML interface.

### Node Line Render Service

Uses [the Node `readline` module](https://nodejs.org/api/readline.html) on the CLI to draw a basic line-based interface.

### Node Ink Render Service

Uses [the Ink library](https://github.com/vadimdemedes/ink) on the CLI to draw a responsive text interface.

## Script Service

The script service invokes command scripts on behalf of world entities.

### Local Script

Run scripts from modules in the current runtime.

## State Service

The state service manages world state, creating it from templates and stepping it each turn.

### Local State

Step state in-memory.

## Template Service

Renders template primitives.

### Chain Template

Uses `(foo|bar)` chains for input and `AND/OR` chains for output.

## Tokenizer Service

### Natural Tokenizer

**Not implemented yet.**

Use natural language processing to tag parts of speech and build a command.

### Word Tokenizer

Simple positional arguments, split on whitespace and with articles removed.

The first word is the verb, and the last word is considered an index, if it is numeric.

For example:

```none
move west
hit goblin 2
```
