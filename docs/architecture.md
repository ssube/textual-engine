# Architecture

This guide covers the engine architecture in detail, describing entities and showing major event flows.

## Contents

- [Architecture](#architecture)
  - [Contents](#contents)
  - [Config](#config)
    - [Locale Config](#locale-config)
    - [Logger Config](#logger-config)
    - [Service Config](#service-config)
  - [Commands](#commands)
    - [Command Tokenization](#command-tokenization)
    - [Common Commands](#common-commands)
    - [Meta Commands](#meta-commands)
    - [Custom Verb Commands](#custom-verb-commands)
  - [Entities](#entities)
    - [Actor Entity](#actor-entity)
    - [Item Entity](#item-entity)
    - [Room Entity](#room-entity)
      - [Room Portal Entity](#room-portal-entity)
  - [Events](#events)
    - [Event Flow: Creating a New World](#event-flow-creating-a-new-world)
    - [Event Flow: Loading an Existing World](#event-flow-loading-an-existing-world)
    - [Event Flow: Command with Local State](#event-flow-command-with-local-state)
    - [Event Flow: Command with Remote State](#event-flow-command-with-remote-state)
  - [Modules](#modules)
    - [Browser Module](#browser-module)
    - [Core Module](#core-module)
    - [Node Module](#node-module)
  - [Services](#services)
  - [Scripts](#scripts)
    - [Script Context](#script-context)
      - [Script Target (`this`)](#script-target-this)
      - [Scope Data](#scope-data)
    - [Signal Scripts](#signal-scripts)
    - [Verb Scripts](#verb-scripts)

## Config

Configuring the engine.

### Locale Config

### Logger Config

### Service Config

## Commands

The player's input lines are parsed into commands for the actor to execute. NPC AI generates input commands directly.

### Command Tokenization

Commands are built by splitting input on whitespace, removing articles (a, an, the, etc) and other filler words, and
assuming the verb and target are in the correct order. Some validation is done when invoking commands, but the parsing
is very simple.

### Common Commands

There are common verbs built into the engine for actions such as:

- `drop` an item
- `hit` an enemy
- `look` at an entity
- `move` to another room
- `take` an item
- `use` an item
- `wait` the turn

### Meta Commands

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

### Custom Verb Commands

World entities may define their own verbs, which can be invoked normally through input.

## Entities

### Actor Entity

TODO: explain actors

### Item Entity

TODO: explain items

### Room Entity

TODO: explain rooms

#### Room Portal Entity

TODO: explain portals

## Events

The entire engine is event-driven, with intentionally little direct coupling between services. Some operations are
too trivial to bus, like translating a string, but any significant change to game state should be sent as an event.

### Event Flow: Creating a New World

<details>
<summary>

When the player sends a `create` command, generate a new world and inform the actor service, which will automatically
join the loaded world.

</summary>

![flowchart with actor joining local world](./events-world-create.svg)

</details>

### Event Flow: Loading an Existing World

<details>
<summary>

When the player sends a `load` command, the path is passed on to the loader, which responds with the loaded state and
triggers the auto-join sequence ([shown in the create event flow](#event-flow-creating-a-new-world)).

</summary>

![flowchart with player input being processed locally](./events-world-load.svg)

</details>

### Event Flow: Command with Local State

<details>
<summary>

When the player submits a world command, it is parsed into commands and triggers a state step, processed locally.

</summary>

![flowchart with player input being processed locally](./events-command-local.svg)

</details>

### Event Flow: Command with Remote State

<details>
<summary>

When the client is connected to a remote state service, with a corresponding remote actor on the server-side, the
command flow is similar but extended. Notably, localization occurs on the client-side after output has been returned,
one reason for having actor services on both sides.

</summary>

![flowchart with player input being sent to remote server](./events-command-remote.svg)

</details>

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
- `AleaRandom`
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

Please see [the services doc](./services.md) for details on what each service does. The list is too long to include
here.

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

### Signal Scripts

Signals are named events on an entity, linked to (named) scripts.

### Verb Scripts

Verbs are custom commands, which invoke a slot with some additional data.
