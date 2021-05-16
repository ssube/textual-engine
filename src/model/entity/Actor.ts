import { SkillMap, SlotMap, StatMap } from '../../util/types';
import { Metadata } from '../meta/Metadata';
import { Template } from '../meta/Template';
import { Entity } from './Base';
import { Item } from './Item';

import { JSONSchemaType } from 'ajv';

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
          items: {
            type: 'object',
            required: [],
          },
        },
        meta: {
          type: 'object',
          required: [],
        },
        type: {
          type: 'object',
          required: [],
        },
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