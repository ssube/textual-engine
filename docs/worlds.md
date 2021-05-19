# Worlds

This guide covers the format of a game world and how to make your own.

## Contents

- [Worlds](#worlds)
  - [Contents](#contents)
  - [Format](#format)
  - [Metadata](#metadata)
    - [ID](#id)
    - [Name](#name)
    - [Description](#description)
  - [Start](#start)
    - [Start Actors](#start-actors)
    - [Start Rooms](#start-rooms)
  - [Templates](#templates)
    - [Template Types](#template-types)
      - [Template Metadata](#template-metadata)
      - [Template Number](#template-number)
      - [Template Ref](#template-ref)
      - [Template String](#template-string)
    - [Actor Templates](#actor-templates)
    - [Item Templates](#item-templates)
    - [Room Templates](#room-templates)

## Format

Worlds are part of a normal data files, which has twin root fields: `states` and `worlds`.

For world templates, the `states` key should be empty: `states: []`. While unused, invalid data here will
cause schema errors, so avoid storing data there.

## Metadata

Worlds have template metadata, with a literal `id` and template strings for the rest.

### ID

This world's ID. Will be used in save games to refer back to the templates later.

### Name

Display name, template string.

### Description

Longer description, template string.

## Start

### Start Actors

A list of possible player actor templates. One of these will be selected and created in the start room.

### Start Rooms

A list of possible start room templates. One of these will be selected and created, then other rooms created as the
starting room's portals are populated.

## Templates

Each type of entity has a corresponding template, with fields replaced by numeric ranges, template strings,
and nested references to other templates.

### Template Types

Template field types correspond to the entity field's type. That is, a string like `name` or `slot` will be
created from a template string, and a number like `stats` from a template number.

#### Template Metadata

Each template has metadata, missing the `template` field that exists in entity metadata.

- `id`: literal ID, not templated
- `name`: template string, display name
- `desc`: template strong, long description

#### Template Number

Template numbers define a range `(min, max)` and select a random integer within that.

TODO: allow floats by adding `step` property, which can be < 1

#### Template Ref

When templates need to include one another, they can refer to the `id` of the other template.

The `chance` of each template being created is a number in `[0, 100]`, where 0 will never be created, and 100 will
always be created. The chance for each template is rolled individually, creating zero or more entities.

#### Template String

Template strings use a series of nested lists, alternating between AND and OR operators, to produce the final
string. The outermost list starts with the OR operator. Items are joined with spaces.

For example, the template `(((gross|slimy)|goblin))` becomes `[[[gross OR slimy] AND goblin]]`, which will resolve
to `gross goblin` or `slimy goblin`.

### Actor Templates

### Item Templates

### Room Templates
