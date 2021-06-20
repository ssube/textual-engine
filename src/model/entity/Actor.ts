import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants';
import { makeConstStringSchema } from '../../util/schema';
import { ScriptMap, NumberMap, StringMap } from '../../util/types';
import { Modifier, MODIFIER_METADATA_SCHEMA } from '../mapped/Modifier';
import { Template, TEMPLATE_REF_SCHEMA, TEMPLATE_STRING_SCHEMA } from '../mapped/Template';
import { Metadata, TEMPLATE_METADATA_SCHEMA } from '../Metadata';
import { Entity } from './Base';
import { Item } from './Item';

export enum ActorSource {
  BEHAVIOR = 'behavior',
  PLAYER = 'player',
  REMOTE = 'remote',
}

export const ACTOR_TYPE = 'actor' as const;

export type ActorType = typeof ACTOR_TYPE;

export interface Actor {
  type: ActorType;
  items: Array<Item>;
  meta: Metadata;
  scripts: ScriptMap;
  slots: StringMap;
  source: ActorSource;
  stats: NumberMap;
}

export function isActor(entity: Optional<Entity>): entity is Actor {
  return doesExist(entity) && entity.type === ACTOR_TYPE;
}

export const ACTOR_MODIFIER_SCHEMA: JSONSchemaType<Modifier<Actor>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: [],
          },
        },
        meta: MODIFIER_METADATA_SCHEMA,
        scripts: {
          type: 'object',
          required: [],
        },
        slots: {
          type: 'object',
          required: [],
        },
        source: TEMPLATE_STRING_SCHEMA,
        stats: {
          type: 'object',
          required: [],
        },
        type: makeConstStringSchema(ACTOR_TYPE),
      },
      required: ['items', 'meta', 'scripts', 'slots', 'stats'],
    },
    chance: {
      type: 'number',
      default: TEMPLATE_CHANCE,
    },
    excludes: {
      type: 'array',
      default: [],
      items: {
        type: 'string',
      },
    },
    id: {
      type: 'string',
    },
  },
  required: ['base', 'id'],
};

export const ACTOR_TEMPLATE_SCHEMA: JSONSchemaType<Template<Actor>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        meta: TEMPLATE_METADATA_SCHEMA,
        scripts: {
          type: 'object',
          required: [],
        },
        slots: {
          type: 'object',
          required: [],
        },
        source: TEMPLATE_STRING_SCHEMA,
        stats: {
          type: 'object',
          required: [],
        },
        type: makeConstStringSchema(ACTOR_TYPE),
      },
      required: ['items', 'meta', 'type', 'scripts', 'stats'],
    },
    mods: {
      type: 'array',
      default: [],
      items: ACTOR_MODIFIER_SCHEMA,
    },
  },
  required: ['base'],
  additionalProperties: false,
};
