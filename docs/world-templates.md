# World Templates

This guide covers the format of a world template and how to make your own.

## Contents

- [World Templates](#world-templates)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [Templates and Modifiers](#templates-and-modifiers)
    - [Instances and Metadata](#instances-and-metadata)
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
  - [How to Implement](#how-to-implement)
    - [Closed and Locked Doors](#closed-and-locked-doors)
    - [Delaying an Actor's Appearance](#delaying-an-actors-appearance)
    - [Introductions, Cutscenes, and Epilogues](#introductions-cutscenes-and-epilogues)
    - [Removing Existing Actors and Items](#removing-existing-actors-and-items)
    - [Replace Items on Interaction](#replace-items-on-interaction)
  - [Template Sections](#template-sections)
    - [Metadata](#metadata)
    - [Entity Defaults](#entity-defaults)
    - [Locale](#locale)
      - [Locale Bundles](#locale-bundles)
      - [Locale Words](#locale-words)
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

### Instances and Metadata

### Rooms and Portals

Each room has some portals, grouped by wall or direction, with a destination room template.

When the player enters a new room, including the starting room, the game generates destination rooms
for each group and creates links in both directions, ensuring the player can backtrack.

### Starting Actors and Rooms

When starting a new game, the world state begins empty. A starting actor and room are selected from
the lists in the world template, then added to the world.

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

World templates are part of the normal data file format, and template files should only have the `worlds` key:

```yaml
# config: {}
# state: []
worlds:
  - meta:
      id: test-world
```

For the typical `YamlParser`, the world should be in a YAML file with UTF-8 encoding.

### Loading Templates from Github

TODO: explain how to load data files from Gist or MR

### Starting New Game from Template

TODO: explain how to create new world from template

## How to Implement

TODO: better title

### Closed and Locked Doors

TODO: explain how to use closed/locked stats

### Delaying an Actor's Appearance

TODO: explain hidden rooms and timed/triggered movement

### Introductions, Cutscenes, and Epilogues

TODO: explain how to use `scene` flag

### Removing Existing Actors and Items

TODO: explain scripted removal

### Replace Items on Interaction

TODO: explain how to use replace verb/signal

## Template Sections

### Metadata

Worlds have template metadata, with a literal `id` and template strings for the rest.

- `id`: string, not templated
  - used in the saved state to refer back to the template world
- `name`: template string, display name
- `desc`: template string, long description

### Entity Defaults

### Locale

#### Locale Bundles

#### Locale Words

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

- `id`: string, not templated
- `name`: template string, display name
- `desc`: template string, long description

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

- `min`: number, inclusive
- `max`: number, exclusive
- `step`: interval between values, optional

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

TODO: explain template script format

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
  - a list of item template refs
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
  - list of actor template refs
- `flags`
  - arbitrary data, short tags
  - a `[string, string]` map
- `items`
  - list of item template refs
- `portals`
  - list of portal template refs
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
  - TODO: explain portal groups
- `scripts`
  - event scripts with name and data
  - a `[string, script]` map
- `stats`

Two portals in the same room and source group will be linked to the same destination room, and portals of the same
names, within the designated target group. If a matching portal cannot be found, one may be added to the room.

<details>

<summary>
For example, with two rooms `room-0` and `room-1`, where each room has two portals, named `door` and `window`:
</summary>

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
