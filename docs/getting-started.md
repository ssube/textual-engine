# Getting Started

This guide covers a little bit of everything in light detail.

## Contents

- [Getting Started](#getting-started)
  - [Contents](#contents)
  - [What Is This?](#what-is-this)
    - [What Is A Text Adventure?](#what-is-a-text-adventure)
    - [Where Can I Play?](#where-can-i-play)
    - [Notable Features](#notable-features)
    - [For Interactive Fiction](#for-interactive-fiction)
    - [For Dungeon Crawlers](#for-dungeon-crawlers)
  - [Concepts](#concepts)
    - [Entity Types](#entity-types)
    - [Command Structure](#command-structure)
    - [Worlds](#worlds)
  - [Playing The Game](#playing-the-game)
    - [Common Commands](#common-commands)
    - [Game Commands](#game-commands)
    - [Creating New Worlds](#creating-new-worlds)
    - [Looking and Moving](#looking-and-moving)
    - [Inventory and Using Items](#inventory-and-using-items)
    - [Health and Hitting Enemies](#health-and-hitting-enemies)
    - [Saving and Loading Worlds](#saving-and-loading-worlds)
  - [Further Reading](#further-reading)
    - [Creating World Templates](#creating-world-templates)
    - [Adding Command Scripts](#adding-command-scripts)
    - [Developing The Engine](#developing-the-engine)
    - [Engine Architecture](#engine-architecture)

## What Is This?

This project is a text adventure engine with a set of sample worlds. Both randomly-generated dungeon crawlers
and intentionally written interactive fiction are possible, in a turn-based system with easy scripting.

### What Is A Text Adventure?

### Where Can I Play?

[A recent version of the game is available on Github Pages](https://ssube.github.io/textual-engine/).

If you have a copy of this repository checked out, the `make run` target will build and launch the game on the CLI,
using the Ink rendering engine and demo world.

If you prefer to run a Docker image, the latest build is published as `ssube/textual-engine:master-stretch`, and can
be run with:

```shell
> docker run --rm -it ssube/textual-engine:master-stretch \
  --config data/config.yml \
  --data file://data/base.yml
```

### Notable Features

TODO:

- monster movement
- world templates
- event-driven engine
- _list more_

### For Interactive Fiction

TODO:

- story-based text adventures may not want or need randomization
- fixed structure
  - no template strings
  - 100% chance on all template refs
  - no procedural rooms, all portals match

### For Dungeon Crawlers

TODO:

- procedural dungeon crawlers
- expanding as player moves
- limited by memory and time
  - pruning old rooms

## Concepts

### Entity Types

The commands shown above often require a target, the game entity with which you want to interact.

Entities come in 3 types, and 1 special not-entity subtype:

- `actor`
  - a player or an NPC with behavior
- `item`
  - objects that can be held and used
- `room`
  - areas within the game
- `portal`
  - passage between rooms

### Command Structure

When using the classic input mode, the structure of each command line should be: `verb [...target] [index]`

For example:

```none
wait
look
move west
hit goblin 2
```

When multiple entities match the `target`, the `index` can be used to differentiate. Both `target` and `index`
are optional in some commands.

A natural-language processing command mode is planned.

### Worlds

## Playing The Game

[A recent version of the game is available on Github Pages](https://ssube.github.io/textual-engine/).

When the game starts, it will automatically create a small world from [the `test` template](../data/base.yml). Some
rooms will be generated before the world loads, and more will be added as you wander. Monsters will attack you when
they are in the same room, and will wander around the world looking for you.

To list the available verbs at any time, enter `help`:

```none
turn 1 > help
available verbs: create, debug, graph, help, load, quit, save, drop, hit, look, move, take, use, wait
```

These verbs are split into two groups: commands to the current world and commands to the game itself (meta-commands).

### Common Commands

- `drop <item>`
  - drop an item from your inventory
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
  - (using items on other actors is a planned feature)
- `wait`
  - skip your turn

### Game Commands

- `create <template> <seed> [depth]`
  - generate a new world from the `template` with the random `seed`
  - the optional `depth` parameter controls the number of rooms (and monsters) generated before the world loads
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

### Creating New Worlds

When the demo loads, it will create a new world from the `test` template and populate some rooms, so you can start
playing right away.

A new world can be created at any point with the `create` command: `create template seed [depth]`.

The `depth` parameter controls the initial size of the world and the number of rooms that will be generated before
the game loads. It does not control the final size of the world, but a large `depth` greater than 10 can cause the
game to load slowly.

A command to list available world templates is planned.

### Looking and Moving

When a world loads, you will have control of an actor in a room somewhere.

You can `look` around the room or at something within the room, like an enemy or item.

Looking at the room will show other actors in the room, items on the floor, and portals into other rooms:

```none
turn 0 > look
player-0 will look the next turn.
You are a player-0: smelly goblin with swords (actor-goblin-11).
You are in Dungeon: damp dungeon (room-dungeon-0).
You are holding a Cracked Sword: short sword with a large crack (short sword with a large crack).
A Goblin is in the room: smelly goblin (actor-goblin-0).
A window leads to the west (room-marsh-1).
A door leads to the east (room-cave-16).
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
You are holding a Cracked Sword: short sword with a large crack (short sword with a large crack).
You see a Rusty Sword: rusting short sword (item-sword-10).
```

You can `take` an item to pick it up, or `drop` something you are already carrying.

Carried items will be automatically used when you `hit` an enemy, but you can `use` an item on yourself to heal.

Using items on actors or with other items is planned.

### Health and Hitting Enemies

You may encounter monsters in the world, waiting in dark rooms or wandering around and looking for you.

When monsters find you, they will often attack:

```none
Sword Goblin (actor-goblin-9) has hit player-0 (actor-goblin-11) with a Sword!
player-0 has 15 health left.
```

Your health, and that of enemies you attack, will be shown after each hit.

If you are holding an item capable of doing damage, you can `hit` them back:

```none
turn 12 > hit sword goblin
player-0 will hit the sword goblin.
player-0 (actor-goblin-11) has hit Sword Goblin (actor-goblin-9) with a Cracked Sword!
Sword Goblin has 12 health left.
```

The maximum damage is based on your actor's damage plus your current item's damage, then a random number between 0
and that maximum is rolled.

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
random decisions: damage rolls and new rooms, in particular. A fix for this is planned.

## Further Reading

More detailed information can be found in [the `docs/` directory](./).

### Creating World Templates

To create worlds, [please see the world templates guide](./world-templates.md).

TODO:

- write the YAML
- how to validate
- post them as gists or use github raw links
- planned: world editor

### Adding Command Scripts

TODO:

- writing command scripts
- adding command script modules

### Developing The Engine

To develop the engine, [please see the development guide](./development.md).

You will need to have a few things installed:

- `make` 4.x
- `node` 12.0 or better
- `yarn` 1.x

Building and testing are run through `make` targets, and running `make help` will print the available targets.

### Engine Architecture

For a description of the engine architecture, [please see the architecture guide](./architecture.md).
