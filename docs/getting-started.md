# Getting Started

This guide covers a little bit of everything in light detail.

## Contents

- [Getting Started](#getting-started)
  - [Contents](#contents)
  - [Playing The Game](#playing-the-game)
    - [Common Commands](#common-commands)
    - [Game Commands](#game-commands)
  - [Creating World Templates](#creating-world-templates)
  - [Developing The Engine](#developing-the-engine)

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

- `drop item`
  - drop an item from your inventory
- `hit enemy`
  - hit an enemy actor
- `look [noun]`
  - describe the current room, or a specific actor or item within it
- `move [direction] [portal]`
  - move through the given portal
  - you must provide one or both of `direction` and `portal`
  - for example, if the `west door` is the only `door` and only portal on the `west` side of the room, any of the following will work:
    - `west`
    - `door`
    - `west door`
- `take item`
  - take an item from the current room
- `use item`
  - use an item on yourself
  - (using items on other actors is a planned feature)
- `wait`
  - skip your turn

### Game Commands

- `create template seed [depth]`
  - generate a new world from the given `template` and `seed`
  - the optional `depth` parameter controls the number of rooms (and monsters) generated before the world loads
- `debug`
  - print a debug view of the world
  - not for normal gameplay
- `graph path`
  - print a debug graph of the world
  - not for normal gameplay
- `help`
  - print the localized list of available verbs
- `load path`
  - load an existing world from the given path
- `quit`
  - stop the game without saving
- `save path`
  - save the current world to the given path

## Creating World Templates

To create worlds, please [see the worlds guide](./worlds.md).

## Developing The Engine

To develop the engine, please [see the development guide](./development.md).
