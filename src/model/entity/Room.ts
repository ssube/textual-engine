import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { makeConstStringSchema } from '../../util/schema';
import { SlotMap, VerbMap } from '../../util/types';
import { Metadata, METADATA_SCHEMA } from '../meta/Metadata';
import { Template, TEMPLATE_REF_SCHEMA } from '../meta/Template';
import { Actor } from './Actor';
import { Entity } from './Base';
import { Item } from './Item';
import { Portal } from './Portal';

export const ROOM_TYPE = 'room' as const;

export interface Room {
  type: typeof ROOM_TYPE;
  meta: Metadata;
  actors: Array<Actor>;
  items: Array<Item>;
  portals: Array<Portal>;
  slots: SlotMap;
  verbs: VerbMap;
}

export function isRoom(entity: Optional<Entity>): entity is Room {
  return doesExist(entity) && entity.type === ROOM_TYPE;
}

export const ROOM_SCHEMA: JSONSchemaType<Template<Room>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        type: makeConstStringSchema(ROOM_TYPE),
        meta: METADATA_SCHEMA,
        actors: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        items: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        portals: {
          type: 'array',
          items: {
            type: 'object',
            required: [],
          },
        },
        slots: {
          type: 'object',
          required: [],
        },
        verbs: {
          type: 'object',
          required: [],
        },
      },
      required: ['actors', 'items', 'meta', 'portals', 'slots', 'type', 'verbs'],
    },
    mods: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        required: [],
      },
    },
  },
  required: ['base'],
};
