import { JSONSchemaType } from 'ajv';

import { makeConstStringSchema } from '../../util/schema';
import { SkillMap, SlotMap, StatMap } from '../../util/types';
import { Metadata, METADATA_SCHEMA } from '../meta/Metadata';
import { Template, TEMPLATE_REF_SCHEMA } from '../meta/Template';
import { Entity } from './Base';
import { Item } from './Item';

export enum ActorType {
  DEFAULT = 'default',
  PLAYER = 'player',
  REMOTE = 'remote',
}

export const ACTOR_TYPE = 'actor';

export interface Actor {
  type: typeof ACTOR_TYPE;
  actorType: ActorType;
  meta: Metadata;
  items: Array<Item>;
  skills: SkillMap;
  slots: SlotMap;
  stats: StatMap;
}

export function isActor(entity: Entity): entity is Actor {
  return entity.type === ACTOR_TYPE;
}

export const ACTOR_SCHEMA: JSONSchemaType<Template<Actor>> = {
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
  },
  required: ['base'],
  additionalProperties: false,
};
