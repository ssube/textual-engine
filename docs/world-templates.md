# World Templates

This guide covers the format of a world template and how to make your own.

## Contents

- [World Templates](#world-templates)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [Templates and Modifiers](#templates-and-modifiers)
    - [Entities and Metadata](#entities-and-metadata)
      - [Example Template Metadata](#example-template-metadata)
      - [Example Modifier Metadata](#example-modifier-metadata)
      - [Example Entity Metadata](#example-entity-metadata)
    - [Flags and Stats](#flags-and-stats)
      - [Entity Flags](#entity-flags)
      - [Entity Stats](#entity-stats)
    - [Rooms and Portals](#rooms-and-portals)
    - [Starting Actors and Rooms](#starting-actors-and-rooms)
    - [YAML Format and Types](#yaml-format-and-types)
      - [Custom Types](#custom-types)
      - [Using JSON](#using-json)
      - [Other Parsers](#other-parsers)
  - [Playing and Testing](#playing-and-testing)
    - [Loading Templates from Local Files](#loading-templates-from-local-files)
    - [Loading Templates from Github](#loading-templates-from-github)
    - [Starting New Game from Template](#starting-new-game-from-template)
  - [Existing Mechanics](#existing-mechanics)
    - [Default Mechanics](#default-mechanics)
    - [Closed and Locked Doors](#closed-and-locked-doors)
    - [Delaying an Actor's Appearance](#delaying-an-actors-appearance)
    - [Introductions, Cutscenes, and Epilogues](#introductions-cutscenes-and-epilogues)
    - [Removing Existing Actors and Items](#removing-existing-actors-and-items)
    - [Replace Items on Interaction](#replace-items-on-interaction)
  - [Template Sections](#template-sections)
    - [Metadata](#metadata)
    - [Entity Defaults](#entity-defaults)
    - [Locale](#locale)
      - [Locale Language](#locale-language)
      - [Language Strings](#language-strings)
    - [Start Entities](#start-entities)
      - [Start Actors](#start-actors)
      - [Start Rooms](#start-rooms)
    - [Template Values](#template-values)
      - [Template Metadata](#template-metadata)
      - [Template Number](#template-number)
      - [Template Reference](#template-reference)
      - [Template Script](#template-script)
      - [Template String](#template-string)
    - [Entity Templates](#entity-templates)
      - [Actor Templates](#actor-templates)
      - [Item Templates](#item-templates)
      - [Room Templates](#room-templates)
      - [Portal Templates](#portal-templates)

## Concepts

### Templates and Modifiers

Every entity is created from a template. Template values may not have any variation and always generate the same
entity, or have a range of values for more procedural worlds.

Within an entity template, string fields are replaced with [template strings](#template-string) and number fields are
replaced with [template numbers](#template-numbers). These are rendered back into a string or number value when an
entity is created from the template.

Each template has a set of `base` values and list of modifiers, often adjectives like sharp or rusty. Modifiers each
have a chance of appearing, and can exclude one another, to prevent mutually exclusive modifiers from appearing
together.

Between the defaults and modifiers, templates have a few layers:

- the world `defaults`
- the `base` template
- select template `mods`

When creating an entity from the template, the world defaults are rendered first, then passed to the `base` template.
Some of the `mods` are randomly selected, then rendered in order, with the result of the previous.

For example, when creating an actor:

- the actor defaults have a base name of `none` (`defaults.actor.name.base`)
- the actor template has a base name of `bat` (`templates.actors.0.base.name.base`)
- the actor template has a modifier with a base name of `vampire {{base}}` (`templates.actors.0.mods.0.name.base`)

Each string will be rendered in order:

- `none`
- `bat` (does not use the `{{base}}` token and so replaces the string entirely)
- `vampire bat`

### Entities and Metadata

Entities are created from templates, and retain a copy of the template ID. While most strings in a template are
template strings, the ID is a literal string. It is not rendered, but will have a sequential numeric suffix appended,
such as `actor-bat-0` and `actor-bat-1`. Modifier metadata omits the ID entirely.

| Field  | Template        | Modifier        | Entity         |
| ------ | --------------- | --------------- | -------------- |
| `desc` | template string | template string | literal string |
| `id`   | literal string  | not present     | literal string |
| `name` | template string | template string | literal string |

The metadata is a convenient container for localization and searching, containing the entity's unique ID along with
its short display name and longer description.

For example:

#### Example Template Metadata

This is how metadata should appear in a base template:

```yaml
meta:
  desc:
    base: bat
  name:
    base: Bat
  id: actor-bat
```

#### Example Modifier Metadata

This is how metadata should appear in a template modifier:

```yaml
meta:
  desc:
    base: vampire {{base}}
  name:
    base: Vampire {{base}}
```

#### Example Entity Metadata

This is how metadata will appear in the saved game state:

```yaml
meta:
  desc: vampire bat
  name: Vampire Bat
  id: actor-bat-0
```

### Flags and Stats

#### Entity Flags

Every world entity has a `flags` field for storing short strings. Flags are meant to help scripts maintain state on
the entity without changing the class, to communicate with other scripts or between invocations of the same script.

Since JS strings are immutable, flags can only set and removed. For numeric data that needs to be changed, helper
function are provided to modify the [entity stats](#entity-stats).

Flags are stored on each entity and must be sent whenever the entity changes or moves into another room, so it is
important to make sure they do not grow too large. If you expect 10 flags per entity, try to keep them under 24
characters per flag.

The flags field is a `[string, string]` map, and flag values are template strings.

For example:

```yaml
flags: !map
  scene:
    base: cutscene-room
```

Some common flags are defined in the engine:

- items with `key` can unlock portals whose ID matches the value
- rooms with `scene` will move actors into a cutscene room if they do not have a flag `scene-${room.meta.id}`
- items with `replace` and a script for `signal.replace` can be replaced with other items
  - tearing a piece of paper into scraps
  - tearing a loaf of bread into crumbs
  - filling out a form

Scripts can add their own flags by setting them. They do not need to be defined in the engine.

#### Entity Stats

Actors and items have `stats` for storing numeric data, like actor health and weapon damage. Helper functions are
provided to get, increment, and decrement stats.

Some common stats are defined in the engine:

- actors with `damage` do additional damage when using weapons
- actors with `health` can be killed
- items with `damage` are weapons and do damage when an actor is `hit` with them
- items with `health` can heal actors

Scripts can add their own stats by setting them. They do not need to be defined in the engine.

Including a minimum and maximum value in each stat is a planned feature: https://github.com/ssube/textual-engine/issues/148

### Rooms and Portals

Each room has some portals, grouped by wall or direction, with a destination room template.

When the player enters a new room, including the starting room, the game generates destination rooms
for each group and creates links in both directions, ensuring the player can backtrack.

### Starting Actors and Rooms

When starting a new game, the world begins empty. One of the starting rooms is selected and created, then populated
with actors, items, and portals. Additional rooms are added to those portals, until the world depth has been reached.

When a new player joins, one of the starting actors is selected and created, unless an actor already exists with that
player's ID. In single-player, the player always joins the new world after `create` or `load` commands.

If there is only one starting room or actor, it will always be used. At least one room or actor must be present.

### YAML Format and Types

YAML is a human-readable config format with support for comments and sensitive to indentation. The
[Red Hat Ansible documentation](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html) has
a good description of the format, and [the CircleCI documentation](https://circleci.com/blog/what-is-yaml-a-beginner-s-guide/)
has some helpful illustrated examples.

Every `textual-engine` data file starts with a dictionary:

```yaml
config: {}  # optional config object
state: []   # optional save state
worlds: []  # list of world templates
```

Please see [the YAML 1.2 specification](https://yaml.org/spec/1.2/spec.html) for the complete syntax.

The [js-yaml library](https://github.com/nodeca/js-yaml) is used to parse YAML and offers [an online demo and validator](https://nodeca.github.io/js-yaml/). `js-yaml` supports the YAML 1.2 specification with custom types.

#### Custom Types

The `textual-engine` YAML schema adds a few custom types:

- `!env`
  - loads an environment variable by name
  - for configuring the server
- `!map`
  - loads a JS `Map` from a YAML dictionary
- `!stream`
  - loads a JS `process` output stream
  - for configuring the log library

For example:

```yaml
config:
  logger:
    level: !env TEXTUAL_LOG_LEVEL
    name: textual-engine
    streams:
      - level: error
        stream: !stream stderr

worlds:
  - # some fields omitted
    templates:
      actors:
        - base:
            flags: !map
              key1: value1
              key2: value2
```

#### Using JSON

If you prefer using JSON over YAML, or want to use tooling that only supports JSON, most of the data file format is
supported with the notable exception of custom types.

The YAML syntax is a superset of JSON, and most of the value types can be written in JSON, including dictionaries
and lists. JSON does not have syntax for custom types and so does not support maps, which prevents JSON worlds from
using flags or stats, unless those fields are written with inline YAML:

```yaml
"dict": {
  "list": [
    1,
    2,
    3
  ],
  "map": !map {
    "key1": "value1",
    "key2": "value2"
  }
}
```

This may be changed in a future release to support strict JSON.

#### Other Parsers

The engine supports pluggable parsers for other file format, including binary formats. Only `YAML` and limited `JSON`
support are included.

## Playing and Testing

### Loading Templates from Local Files

To load a world template from a local file, such as one you are editing, use the `load` command with a `file://` path:

```none
> load file://data/samples/alice.yml

no world states loaded from file://data/samples/alice.yml
```

Improving this output to indicate whether world templates were loaded is a planned feature: https://github.com/ssube/textual-engine/issues/153

### Loading Templates from Github

To load a world template from Github, use the raw file link from the Gist or pull request, with the `https://` protocol:

```none
> load https://raw.githubusercontent.com/ssube/textual-engine/master/data/demo.yml

no world states loaded from https://raw.githubusercontent.com/ssube/textual-engine/master/data/demo.yml
```

This allows you to test new worlds from a branch or PR without checking it out locally.

### Starting New Game from Template

To start a new game and create an instance of your world template, make sure it is loaded by listing the `worlds`:

```none
> worlds

test world (test)
Alice in Wonderland (sample-alice)
```

Then `create` a new world using the template ID, with the world seed and number of rooms to generate before loading:

```none
> create a sample-alice with test seed and 4

created new world Alice in Wonderland (sample-alice-1) from sample-alice with seed of test seed and room depth of 4

> look
Alice will look the next turn.
You are a Alice: Alice in Wonderland (player-0).
You have 20 health.
You are in a Introduction: a garden with a rose tree (room-intro-21).
You see a Rose: red rose with sharp thorns (item-rose-12).
You see a Painted Rose: painted white rose with sharp thorns (item-rose-13).
You see a Rose: red rose with sharp thorns (item-rose-14).
```

## Existing Mechanics

### Default Mechanics

A number of simple mechanics are built into the engine:

- looking at actors, items, and through portals
- moving between rooms
- using items
  - for damage and health effects
  - on yourself and other actors
- basic inventory
  - taking and dropping items
  - using items from inventory
- equipping items into character-specific slots

These are enabled by default, using the required fields in each template.

Some more complex features require the template to set additional flags or scripts.

### Closed and Locked Doors

TODO: explain how to use closed/locked stats

### Delaying an Actor's Appearance

TODO: explain hidden rooms and timed/triggered movement

### Introductions, Cutscenes, and Epilogues

TODO: explain how to use `scene` flag

### Removing Existing Actors and Items

TODO: explain removing entities from script

### Replace Items on Interaction

TODO: explain how to use replace verb/signal

## Template Sections

### Metadata

Worlds have template metadata, with a literal `id` and template strings for the rest.

- `id`
  - used in the saved state to refer back to the template world
  - literal string, not templated
- `name`
  - short display name
  - a template string
- `desc`
  - longer description
  - a template string

### Entity Defaults

TODO: describe entity defaults

### Locale

Worlds may define multiple languages in their locale bundle. The key for each language should be its
[ISO 639-1, 639-2, or 639-3 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

For example:

```yaml
locale:
  languages:
    de: {}
    en: {}
    es: {}
```

#### Locale Language

Each language contains word lists for the recognized parts of speech, along with a nested dictionary for longer
strings.

The recognized parts of speech are:

- articles
  - ignored while parsing
- prepositions
  - used to split multiple targets into phrases
- verbs
  - decide which actor script to invoke

```yaml
locale:
  languages:
    en: 
      articles: []
      prepositions: []
      strings: {}
      verbs: []
```

Items in the word lists may use translation keys from `strings`.

#### Language Strings

The `strings` section of each language is a `[string, string | nested]` dictionary. Values may be strings, or nested
dictionaries, whose keys may be strings, or further dictionaries.

Translation strings for similar messages (using an item, using an actor, and a missing use target) should be grouped
under a common key.

For example:

```yaml
languages:
  en:
    strings:
      meta:
        create: 'created new world {{state.name}} ({{state.id}}) from {{world}} with seed of {{seed}} and room depth of {{depth}}'
        debug:
          none: 'no world state to debug'
        graph:
          none: 'no world state to graph'
        help: 'available verbs: {{verbs}}'
        load:
          none: 'no world states loaded from {{-path}}'
          state: 'loaded world state {{meta.id}} from {{-path}}'
        quit: 'quitting'
        save:
          none: 'no world state to save'
          state: 'saved world state {{meta.id}} from {{-path}}'
        step:
          none: 'please create a world before using any verbs'
        world: '{{name}} ({{id}})'
```

### Start Entities

#### Start Actors

A list of possible player actor templates. One of these will be selected and created in the start room for each
player.

#### Start Rooms

A list of possible start room templates. One of these will be selected and created, then other rooms created as the
starting room's portals are populated. New player actors will be placed in the start room.

### Template Values

Template field types correspond to the entity field's type. That is, a string like `name` or `slot` will be
created from a template string, and a number like `stats` from a template number.

#### Template Metadata

Each template has metadata, missing the `template` field that exists in entity metadata.

- `id`
  - literal string, not templated
- `name`
  - short display name
  - a template string
- `desc`
  - longer description
  - a template string

For example:

```yaml
meta:
  id: goblin
  name:
    base: Goblin
  desc:
    base: (slimy|smelly) goblin
```

#### Template Number

Template numbers define a range `[min, max)` and select a random integer within that.

- `min`
  - minimum value, inclusive
  - number
- `max`
  - maximum value, exclusive
  - number
- `step`
  - interval between values
  - number
  - optional, defaults to 1

For example:

```yaml
stats: !map
  health:
    min: 10
    max: 20
    step: 5  # produces 10, 15, or 20
```

#### Template Reference

When templates need to include one another, they can refer to the `id` of the other template.

The `chance` of each template being created is a number in `[0, 100]`, where 0 will never be created, and 100 will
always be created. The chance for each template is rolled individually, creating zero or more entities.

For example:

```yaml
items:
  - id: item-sword
    chance: 25
```

#### Template Script

When templates need to use a script, they can refer to the `name` and pass some data. The script `name` must be
recognized by the script service. The `data` will be merged with existing data and passed on to the script.

- `data`
  - additional data to pass
  - values may be template numbers or strings
  - a `[string, number | string]` map
- `name`
  - a template string

For example:

```yaml
scripts: !map
  signal.get:
    data: !map {}
    name:
      base: signal-actor-get
  verbs.common.look:
    data: !map {}
    name:
      base: verb-actor-look
```

#### Template String

Template strings use a series of nested lists, alternating between AND and OR operators, to produce the final
string. The whole string starts with the AND operator to join words, so parenthesized groups start with OR, then AND,
and so on. Items are split on whitespace and joined with spaces.

The template `(gross|slimy) goblin` becomes `[[gross OR slimy] AND goblin]`, which will resolve
to one of `gross goblin` or `slimy goblin`.

For example:

```yaml
meta:
  desc:
    base: (gross|slimy) goblin
```

### Entity Templates

Each type of entity has a corresponding template, with fields replaced by numeric ranges, template strings,
and nested references to other templates.

#### Actor Templates

Actor templates have metadata and scripts, act as a container for items (inventory), and store some numeric stats.

- `meta`
  - template metadata
- `flags`
  - arbitrary data, short tags
  - a `[string, string]` map
- `items`
  - a list of item template references
- `scripts`
  - signal and verb scripts
  - a `[string, string]` map
- `slots`
  - equipment slots
  - a `[string, string]` map
- `stats`
  - actor statistics (health, stamina, etc)
  - a `[string, number]` map

#### Item Templates

Item templates have metadata and scripts, have custom verbs, and store some numeric stats.

- `meta`
  - template metadata
- `flags`
  - arbitrary data, short tags
  - a `[string, string]` map
- `scripts`
  - event scripts with name and data
  - a `[string, script]` map
- `slot`
  - filter for slots into which this item can be equipped
  - a string template
- `stats`
  - item statistics (health, damage, etc)
  - a `[string, number]` map

#### Room Templates

Room templates have metadata and scripts, have custom verbs, and act as a container for actors, items, and portals.

- `meta`
  - template metadata
- `actors`
  - list of actor template references
- `flags`
  - arbitrary data, short tags
  - a `[string, string]` map
- `items`
  - list of item template references
- `portals`
  - list of portal template references
- `scripts`
  - event scripts with name and data
  - a `[string, script]` map

#### Portal Templates

Rooms are linked together through portals.

Portals have source and target groups, and the engine attempts to link them by name, within the appropriate groups.

- `meta`
  - template metadata
- `dest`
  - destination room ID
  - a template string
  - portals may be linked to existing rooms, which uses the `group` rather than `dest`
- `flags`
  - arbitrary data, short tags
  - a `[string, string]` map
- `group`
  - how this portal will be linked to other rooms
  - a complex type:
    - `key`
      - the name of the group
      - a template string
    - `source`
      - the side of the room with this portal
      - a template string
    - `target`
      - the side of the room with the target portal
      - a template string
- `scripts`
  - event scripts with name and data
  - a `[string, script]` map
- `stats`
  - item statistics (closed, locked, etc)
  - a `[string, number]` map

Two portals in the same room and source group will be linked to the same destination room, and portals of the same
names, within the designated target group. If a matching portal cannot be found, one may be added to the room.

<details>

<summary>
For example, with two rooms linked by two ports:
</summary>

Two rooms, `room-north` and `room-south`, where each room has two portals, in the `door` and `window` groups:

```yaml
portals:
  - base:
      meta:
        id:
          base: portal-door-north
      dest:
        base: room-north
      group:
        key:
          base: door
        source:
          base: north
        target:
          base: south
  - base:
      meta:
        id:
          base: portal-window-north
      dest:
        base: room-north
      group:
        key:
          base: window
        source:
          base: north
        target:
          base: south
  - base:
      meta:
        id:
          base: portal-door-south
      dest:
        base: room-south
      group:
        key:
          base: door
        source:
          base: south
        target:
          base: north
  - base:
      meta:
        id:
          base: portal-window-south
      dest:
        base: room-south
      group:
        key:
          base: window
        source:
          base: south
        target:
          base: north

rooms:
  - base:
      meta:
        id:
          base: room-south
      portals:
        - id: portal-door-north
        - id: portal-window-north
  - base:
      meta:
        id:
          base: room-north
      portals:
        - id: portal-door-south
        - id: portal-window-south
```

Note the `dest` changes to the other room, and the `sourceGroup` and `targetGroup` are reversed.

</details>

This will produce a pair of rooms with two bidirectional links, like:

```none
+----------+          +----------+
|          |   door   |          |
|          +<-------->+          |
|  room-0  |          |  room-1  |
|          +<-------->+          |
|          |  window  |          |
+----------+          +----------+
```
