import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { makeConstStringSchema } from '../../util/schema';
import { ScriptMap } from '../../util/types';
import { Template, TEMPLATE_REF_SCHEMA } from '../mapped/Template';
import { Metadata, TEMPLATE_METADATA_SCHEMA } from '../Metadata';
import { Actor } from './Actor';
import { Entity } from './Base';
import { Item } from './Item';
import { Portal } from './Portal';

export const ROOM_TYPE = 'room' as const;

export type RoomType = typeof ROOM_TYPE;

export interface Room {
  type: RoomType;
  meta: Metadata;
  actors: Array<Actor>;
  items: Array<Item>;
  portals: Array<Portal>;
  scripts: ScriptMap;
}

export function isRoom(entity: Optional<Entity>): entity is Room {
  return doesExist(entity) && entity.type === ROOM_TYPE;
}

export const ROOM_TEMPLATE_SCHEMA: JSONSchemaType<Template<Room>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        type: makeConstStringSchema(ROOM_TYPE),
        meta: TEMPLATE_METADATA_SCHEMA,
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
          items: TEMPLATE_REF_SCHEMA,
        },
        scripts: {
          type: 'object',
          required: [],
        },
      },
      required: ['actors', 'items', 'meta', 'portals', 'scripts', 'type'],
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
