import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants';
import { makeConstStringSchema } from '../../util/schema';
import { SkillMap, SlotMap, StatMap } from '../../util/types';
import { Modifier } from '../mapped/Modifier';
import { Template, TEMPLATE_REF_SCHEMA } from '../mapped/Template';
import { Metadata, METADATA_SCHEMA } from '../Metadata';
import { Entity } from './Base';
import { Item } from './Item';

export enum ActorType {
  DEFAULT = 'default',
  PLAYER = 'player',
  REMOTE = 'remote',
}

export const ACTOR_TYPE = 'actor' as const;

export interface Actor {
  type: typeof ACTOR_TYPE;
  actorType: ActorType;
  meta: Metadata;
  items: Array<Item>;
  skills: SkillMap;
  slots: SlotMap;
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
      /* properties: {
        meta: MODIFIER_METADATA_SCHEMA,
      }, */
      required: ['meta'],
    },
    chance: {
      type: 'number',
      default: TEMPLATE_CHANCE,
    },
    excludes: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    id: {
      type: 'string',
    },
  },
  required: [],
};

export const ACTOR_TEMPLATE_SCHEMA: JSONSchemaType<Template<Actor>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        actorType: {
          type: 'object',
          required: [],
        },
        items: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        meta: METADATA_SCHEMA,
        type: makeConstStringSchema(ACTOR_TYPE),
        skills: {
          type: 'object',
          required: [],
        },
        stats: {
          type: 'object',
          required: [],
        },
        slots: {
          type: 'object',
          required: [],
        },
      },
      required: ['items', 'meta', 'type', 'skills', 'stats', 'slots'],
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
