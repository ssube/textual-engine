# Getting Started

This guide covers a little bit of everything in light detail.

## Contents

- [Getting Started](#getting-started)
  - [Contents](#contents)
  - [What Is This?](#what-is-this)
    - [What Is A Text Adventure?](#what-is-a-text-adventure)
    - [Where Can I Play?](#where-can-i-play)
    - [Notable Features](#notable-features)
      - [For Dungeon Crawlers](#for-dungeon-crawlers)
      - [For Narrative Fiction](#for-narrative-fiction)
  - [Concepts](#concepts)
    - [Command Structure](#command-structure)
    - [Entity Types](#entity-types)
    - [Worlds and Templates](#worlds-and-templates)
  - [Playing The Game](#playing-the-game)
    - [World Commands](#world-commands)
    - [Meta Commands](#meta-commands)
    - [Looking and Moving](#looking-and-moving)
    - [Inventory and Using Items](#inventory-and-using-items)
    - [Health and Hitting Enemies](#health-and-hitting-enemies)
    - [Saving and Loading Worlds](#saving-and-loading-worlds)
    - [Creating New Worlds](#creating-new-worlds)
  - [Further Reading](#further-reading)
    - [Creating World Templates](#creating-world-templates)
    - [Developing The Engine](#developing-the-engine)
    - [Engine Architecture](#engine-architecture)

## What Is This?

This project is a text adventure engine with a set of sample worlds. Both randomly-generated dungeon crawlers
and intentionally written interactive fiction are possible, in a turn-based system with easy scripting.

### What Is A Text Adventure?

Text adventures are some of the oldest computer games, including a huge range of titles, from classic literature
adapted as [interactive fiction](https://en.wikipedia.org/wiki/Interactive_fiction#Notable_works) to
[Roguelikes](https://en.wikipedia.org/wiki/Text-based_game#Roguelike) with random dungeons and ASCII tiles. Text
adventures have been documented since the 1960s, became commercially successful in the 1970s and 80s, and now enjoy
a [large supply of indie releases](https://textadventures.co.uk/).

### Where Can I Play?

[A recent version of the game is available on Github Pages](https://ssube.github.io/textual-engine/).

If you have a copy of this repository checked out, the `make run` target will build and launch the game on the CLI,
using the Ink rendering engine and demo world.

If you prefer to run a Docker image, the latest build is published as `ssube/textual-engine:master-stretch`, and can
be run with:

```shell
> docker run --rm -it ssube/textual-engine:master-stretch \
  --config data/config.yml \
  --data file://data/demo.yml
```

### Notable Features

If a concept exists in computer science, it has been applied to text adventures at some point in history - they started
using NLP in the 1960s. `textual-engine` scales up to larger worlds with many thousand rooms, while attempting to
retain some of the depth that made early text adventures such a defining genre.

The world grows as the player moves through it, with new rooms being added from the world template (and optionally
pruned to limit the size of saved games). `textual-engine` supports both dungeon crawlers with randomly generated rooms
and more structured interactive fiction with pre-written rooms. Within the game world, monsters have emergent behavior,
watching the room they are in and wandering if they have not seen a player recently.

`textual-engine` runs on both the CLI and in recent browsers, with a demo hosted on Github pages. It is an event-driven
and service-oriented architecture, with replaceable controllers for actor AI, rendering, world state simulation, and
even the event bus. Resource loaders are provided for many common protocols, such as local files and HTTPS resources,
giving players an easy way to load new worlds. Text output is fully localized by the client and world templates can
include multiple languages without duplicating templates.

Command verbs are implemented as extension methods on the entity models, with network-safe helpers to search the world
for other entities and show output to the player. Scripts are invoked through a named signal system, where events in
the game engine invoke a named script on the target entity, and can be extended through the module system.

#### For Dungeon Crawlers

`textual-engine` can be used for procedural dungeon crawlers: the world is generated from a starting room and series
of templates, following the portals between rooms. With a wide variety of rooms and enemies, the player can explore
sprawling worlds, limited only by memory and processing power. Non-player actors can interact with items and each
other, and wander between rooms. The world will continue to expand as the player moves between rooms, until all
available portals have been connected.

Pruning old rooms to allow infinite exploration is a planned feature: https://github.com/ssube/textual-engine/issues/13

#### For Narrative Fiction

`textual-engine` can also be used for narrative fiction: predictable and guided worlds can be created by linking a
single starting room with a single destination for each portal. Using the template system, you can add slight
variations to flavor text, while keeping room and character names constant. Some stories do not need random worlds,
and the procedural creation can be disabled.

## Concepts

### Command Structure

When using the classic input mode, the structure of each command line should be `verb [...target] [index]`. The `verb`
is always required, while the `target` and `index` are optional in some commands (see
[the list of commands](#world-commands) for specifics).

For example:

```none
wait
look
move west
hit goblin 2
```

The `target` can be an entity's name or its unique ID, if the name might be ambiguous. For example, in this room:

```none
You are in Dungeon: damp dungeon (room-dungeon-0).
You are holding a Cracked Sword: short sword with a large crack (item-sword-15).
A Goblin is in the room: smelly goblin (actor-goblin-0).
A window leads to the west (room-marsh-1).
A door leads to the east (room-cave-16).
```

The valid targets include:

- `sword`, `cracked sword`, and `item-sword-15` all refer to the short sword you are holding
- `goblin` or `actor-goblin-0` is the smelly goblin enemy
- `window`, `west`, and `west window` all lead to `room-marsh-1`

When multiple entities match the `target`, the `index` can be used to differentiate.

### Entity Types

The commands shown above often require a target, the game entity with which you want to interact. There are a few
kinds of entities in the world:

- `actor`
  - a player character responding to input
  - or an NPC character with AI behavior
- `item`
  - objects that can be carried and used
- `room`
  - areas within the game
  - both indoor and outdoor areas

The portals that lead into other rooms are also valid targets, but are not proper entities on their own.

### Worlds and Templates

The game world is created from a template, when the demo loads or using the `create` command. Once a game world
has been created, it can be saved and reloaded later, resuming from the last turn with the same player character.
Templates can be loaded directly from Github or another `https` source using the `load` command.

## Playing The Game

[A recent version of the game is available on Github Pages](https://ssube.github.io/textual-engine/).

When the game starts, it will automatically create a small world from [the `test` template](../data/demo.yml). Some
rooms will be generated before the world loads, and more will be added as you wander. Monsters will attack you when
they are in the same room, and will wander around the world looking for you.

To list the available verbs at any time, enter `help`:

```none
turn 1 > help
available verbs: create, debug, graph, help, load, quit, save, drop, hit, look, move, take, use, wait
```

These verbs are split into two groups: commands to the game world and meta-commands to the game itself.

The current world and room can provide verbs of their own, or remove some of the common verbs. If you find
yourself unable to `move`, check the `help` for a list of available verbs.

### World Commands

- `drop <item>`
  - drop an item from your inventora list of y
- `equip <item>`
  - equip an item from your inventory
  - your equipped weapon will be used to hit
- `hit <actor>`
  - hit an enemy actor
- `look [entity]`
  - describe the current room, or a specific actor or item within it
- `move [group] [name]`
  - move through the named portal
  - you must provide one or both of `direction` and `portal`
  - for example, if the `west door` is the only `door` and only portal on the `west` side of the room, any of the following will work:
    - `west`
    - `door`
    - `west door`
- `take <item>`
  - take an item from the current room
- `use <item>`
  - use an item on yourself
  - using items on other actors is a planned feature: https://github.com/ssube/textual-engine/issues/102
- `wait`
  - skip your turn

### Meta Commands

- `create <template> <seed> [depth]`
  - generate a new world from the `template` with the random `seed`
  - the optional `depth` parameter controls the number of rooms (and monsters) generated before the world loads
  - the default `depth` is 4, and values greater than 12 will generate thousands of rooms, slowing the game down
- `debug`
  - print a debug view of the world
  - not for normal gameplay
- `graph <path>`
  - save a debug graph of the world to `path`
  - not for normal gameplay
- `help`
  - print the localized list of available verbs
- `load <path>`
  - load an existing world from `path`
- `quit`
  - stop the game without saving
- `save <path>`
  - save the current world to `path`

### Looking and Moving

When a world loads, you will have control of an actor in a room somewhere.

You can `look` around the room or at something within the room, like an enemy or item.

Looking at the room will show other actors in the room, items on the floor, and portals into other rooms:

```none
turn 0 > look
player-0 will look the next turn.
You are a player-0: smelly goblin with swords (actor-goblin-11).
You are in Dungeon: damp dungeon (room-dungeon-0).
You are holding a Cracked Sword: short sword with a large crack (item-sword-15).
A Goblin is in the room: smelly goblin (actor-goblin-0).
A window leads to the west (room-marsh-1).
A door leads to the east (room-cave-16).
```

You can also `look` at an actor or item within the room for more details:

```none
turn 1 > look goblin
player-0 will look the goblin.
A Goblin is in the room: smelly goblin (actor-goblin-0).
```

You can `move` through a portal into another room by name (`window`), group (`west`), or both (`west window`). Portals
in the same group typically lead to the same room, but that is not guaranteed, so keep a close eye on where you are
going.

For example, if the room has two portals named `door`, one in each of the `east` and `west` groups, you can refer to
them with:

- `move east`, `move east door`, or `move door 1`
- `move west`, `move west door`, or `move door 2`

### Inventory and Using Items

You may find items around the world, lying on the floor of rooms or dropped by enemies on their death. These can be
picked up, carried, and later used on yourself or to fight enemies.

When you `look` around, your inventory will be listed, followed by items in the current room:

```none
You are holding a Cracked Sword: short sword with a large crack (item-sword-15).
You see a Rusty Sword: rusting short sword (item-sword-10).
```

You can `take` an item to pick it up, or `drop` something you are already carrying. There is not an inventory limit
at this time.

Carried items will be automatically used when you `hit` an enemy, but you can `use` an item on yourself to heal.

Using items on actors or with other items is planned (https://github.com/ssube/textual-engine/issues/102, https://github.com/ssube/textual-engine/issues/107).

### Health and Hitting Enemies

You may encounter monsters in the world, waiting in dark rooms or wandering around and looking for you.

When monsters find you, they will often attack:

```none
Sword Goblin (actor-goblin-9) has hit player-0 (actor-goblin-11) with a Sword!
player-0 has 15 health left.
```

Your health will be shown after each hit, and can be shown in the optional status bar. Enemy health will be shown
after each hit.

If you are holding an item capable of doing damage, you can `equip` it and `hit` them back:

```none
turn 11 > equip cracked sword
Sword Goblin will equip the Cracked Sword.
You equip the Cracked Sword in your weapon-hand-left.
turn 12 > hit sword goblin
player-0 will hit the sword goblin.
player-0 (actor-goblin-11) has hit Sword Goblin (actor-goblin-9) with a Cracked Sword!
Sword Goblin has 12 health left.
```

The maximum damage is based on your actor's damage plus your current weapon's damage, then a random number between 0
and that maximum is rolled.

Some characters will have natural weapons like teeth, and may not be able to hold weapons in their hands - they may
not even have hands.

### Saving and Loading Worlds

You can `save` the current world and continue your game later by supplying a path. When playing on the local CLI,
use the `file://` protocol:

```none
save file:///home/ssube/textual-saves/example.yml
saved world test-0 state to file:///home/ssube/textual-saves/example.yml
```

You can `load` the saved game later and resume playing:

```none
load file:///home/ssube/textual-saves/example.yml
loaded world test-0 state from file:///home/ssube/textual-saves/example.yml
```

Note: the PRNG does not yet resume where it left off, so saving and loading a game may change the outcome of
random decisions: damage rolls and new rooms, in particular. A fix for this is planned (https://github.com/ssube/textual-engine/issues/108).

### Creating New Worlds

When the demo loads, it will create a new world from the `test` template and populate some rooms, so you can start
playing right away.

A new world can be created at any point with the `create` command: `create template seed [depth]`.

The `depth` parameter controls the initial size of the world and the number of rooms that will be generated before
the game loads, but it does not control the final size of the world.

The available worlds can be listed with the `worlds` command.

## Further Reading

More detailed information can be found in [the `docs/` directory](./).

### Creating World Templates

To create worlds, [please see the world templates guide](./world-templates.md).

TODO:

- write the YAML
- how to validate
- post them as gists or use github raw links
- planned: world editor (https://github.com/ssube/textual-engine/issues/73)

### Developing The Engine

To develop the engine, [please see the development guide](./development.md).

You will need to have a few things installed:

- `make` 4.x
- `node` 12.0 or better
- `yarn` 1.x

Building and testing are run through `make` targets, and running `make help` will print the available targets.

### Engine Architecture

For a description of the engine architecture, [please see the architecture guide](./architecture.md).
