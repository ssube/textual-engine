# World Templates

This guide covers the format of a world template and how to make your own.

## Contents

- [World Templates](#world-templates)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [Starting Actor & Room](#starting-actor--room)
    - [Rooms & Portals](#rooms--portals)
  - [Loading Worlds](#loading-worlds)
  - [Metadata](#metadata)
  - [Start](#start)
    - [Start Actors](#start-actors)
    - [Start Rooms](#start-rooms)
  - [Templates](#templates)
    - [Template Types](#template-types)
      - [Template Metadata](#template-metadata)
      - [Template Number](#template-number)
      - [Template Reference](#template-reference)
      - [Template String](#template-string)
    - [Actor Templates](#actor-templates)
    - [Item Templates](#item-templates)
    - [Room Templates](#room-templates)
      - [Room Portal Templates](#room-portal-templates)

## Concepts

### Starting Actor & Room

When starting a new game, the world state begins empty. A starting actor and room are selected from
the lists in the world template, then added to the world.

### Rooms & Portals

Each room has some portals, grouped by wall or direction, with a destination room template.

When the player enters a new room, including the starting room, the game generates destination rooms
for each group and creates links in both directions, ensuring the player can backtrack.

## Loading Worlds

World templates are part of a normal data files, which should not have the `config` and `state` keys:

```yaml
# config: {}
# state: []
worlds:
  - meta:
      id: test-world
```

For the typical `YamlParser`, the world should be in a YAML file with UTF-8 encoding.

## Metadata

Worlds have template metadata, with a literal `id` and template strings for the rest.

- `id`: string, not templated
  - used in the saved state to refer back to the template world
- `name`: template string, display name
- `desc`: template string, long description

## Start

### Start Actors

A list of possible player actor templates. One of these will be selected and created in the start room for each
player.

### Start Rooms

A list of possible start room templates. One of these will be selected and created, then other rooms created as the
starting room's portals are populated. New player actors will be placed in the start room.

## Templates

Each type of entity has a corresponding template, with fields replaced by numeric ranges, template strings,
and nested references to other templates.

### Template Types

Template field types correspond to the entity field's type. That is, a string like `name` or `slot` will be
created from a template string, and a number like `stats` from a template number.

#### Template Metadata

Each template has metadata, missing the `template` field that exists in entity metadata.

- `id`: string, not templated
- `name`: template string, display name
- `desc`: template string, long description

#### Template Number

Template numbers define a range `(min, max)` and select a random integer within that.

- `min`: number
- `max`: number

TODO: document whether min and max are inclusive or exclusive

#### Template Reference

When templates need to include one another, they can refer to the `id` of the other template.

The `chance` of each template being created is a number in `[0, 100]`, where 0 will never be created, and 100 will
always be created. The chance for each template is rolled individually, creating zero or more entities.

#### Template String

Template strings use a series of nested lists, alternating between AND and OR operators, to produce the final
string. The outermost list starts with the AND operator. Items are joined with spaces.

For example, the template `((gross|slimy)|goblin)` becomes `[[gross OR slimy] AND goblin]`, which will resolve
to one of `gross goblin` or `slimy goblin`.

### Actor Templates

Actor templates have metadata and slots, act as a container for items (inventory), and store some numeric data (skills
and stats).

- `meta`: template metadata
- `items`: list of item template refs
- `skills`: a `[string, number]` map of actor skills (swords, bows, etc)
- `slots`: a `[string, string]` map of event scripts
- `stats`: a `[string, number]` map of actor statistics (health, stamina, etc)

### Item Templates

Item templates have metadata and slots, have custom verbs, and store some numeric data (skills and stats).

- `meta`: template metadata
- `slots`: a `[string, string]` map of event scripts
- `stats`: a `[string, number]` map of item statistics (health, damage, etc)
- `verbs`: a map, unused

### Room Templates

Room templates have metadata and slots, have custom verbs, and act as a container for actors, items, and portals.

- `meta`: template metadata
- `actors`: list of actor template refs
- `items`: list of item template refs
- `portals`: list of portal templates
- `slots`: a `[string, string]` map of event scripts
- `verbs`: a map, unused

#### Room Portal Templates

Rooms are linked together through portals.

Portals have source and target groups, and the engine attempts to link them by name, within the appropriate groups.

Two portals in the same room and source group will be linked to the same destination room, and portals of the same
names, within the designated target group. If a matching portal cannot be found, one may be added to the room.

For example, with two rooms `room-0` and `room-1`, where each room has two portals, named `door` and `window`:

```yaml
rooms:
  - meta:
      id: room-0
    portals:
      - name: door
        dest: room-1
        sourceGroup: north
        targetGroup: south
      - name: window
        dest: room-1
        sourceGroup: north
        targetGroup: south
  - meta:
      id: room-1
    portals:
      - name: door
        dest: room-0
        sourceGroup: south
        targetGroup: north
      - name: window
        dest: room-0
        sourceGroup: south
        targetGroup: north
```

Note the `dest` changes to the other room, and the `sourceGroup` and `targetGroup` are reversed.

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
