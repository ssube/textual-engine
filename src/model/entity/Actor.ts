import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants';
import { makeConstStringSchema } from '../../util/schema';
import { ScriptMap, StatMap } from '../../util/types';
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
  source: ActorSource;
  stats: StatMap;
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
        source: TEMPLATE_STRING_SCHEMA,
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: [],
          },
        },
        meta: MODIFIER_METADATA_SCHEMA,
        stats: {
          type: 'object',
          required: [],
        },
        scripts: {
          type: 'object',
          required: [],
        },
        type: TEMPLATE_STRING_SCHEMA,
      },
      required: ['meta'],
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
        source: {
          type: 'object',
          required: [],
        },
        items: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        meta: TEMPLATE_METADATA_SCHEMA,
        type: makeConstStringSchema(ACTOR_TYPE),
        stats: {
          type: 'object',
          required: [],
        },
        scripts: {
          type: 'object',
          required: [],
        },
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
