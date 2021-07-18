import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants';
import { makeConstStringSchema } from '../../util/schema';
import { Immutable, StringMap } from '../../util/types';
import { Modifier, MODIFIER_METADATA_SCHEMA } from '../mapped/Modifier';
import { Template, TEMPLATE_REF_SCHEMA, TEMPLATE_SCRIPT_SCHEMA, TEMPLATE_STRING_SCHEMA } from '../mapped/Template';
import { Metadata, TEMPLATE_METADATA_SCHEMA } from '../Metadata';
import { ScriptMap } from '../Script';
import { Actor } from './Actor';
import { Entity } from './Base';
import { Item } from './Item';
import { Portal } from './Portal';

export const ROOM_TYPE = 'room' as const;

export type RoomType = typeof ROOM_TYPE;

export interface Room {
  actors: Array<Actor>;
  flags: StringMap;
  items: Array<Item>;
  meta: Metadata;
  portals: Array<Portal>;
  scripts: ScriptMap;
  type: RoomType;
}

export type ReadonlyRoom = Immutable<Room>;

export function isRoom(entity: Optional<Immutable<Entity>>): entity is ReadonlyRoom;
export function isRoom(entity: Optional<Entity>): entity is Room;
export function isRoom(entity: Optional<Entity>): entity is Room {
  return doesExist(entity) && entity.type === ROOM_TYPE;
}

export const ROOM_MODIFIER_SCHEMA: JSONSchemaType<Modifier<Room>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        actors: {
          type: 'array',
          nullable: true,
          items: TEMPLATE_REF_SCHEMA,
        },
        flags: {
          type: 'object',
          nullable: true,
          map: {
            keys: {
              type: 'string',
            },
            values: TEMPLATE_STRING_SCHEMA,
          },
          required: [],
        },
        items: {
          type: 'array',
          nullable: true,
          items: TEMPLATE_REF_SCHEMA,
        },
        meta: {
          ...MODIFIER_METADATA_SCHEMA,
          nullable: true,
        },
        portals: {
          type: 'array',
          nullable: true,
          items: TEMPLATE_REF_SCHEMA,
        },
        scripts: {
          type: 'object',
          nullable: true,
          map: {
            keys: {
              type: 'string',
            },
            values: TEMPLATE_SCRIPT_SCHEMA,
          },
          required: [],
        },
        type: {
          ...makeConstStringSchema(ROOM_TYPE),
          nullable: true,
        },
      },
      required: [],
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

export const ROOM_TEMPLATE_SCHEMA: JSONSchemaType<Template<Room>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        actors: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        flags: {
          type: 'object',
          map: {
            keys: {
              type: 'string',
            },
            values: TEMPLATE_STRING_SCHEMA,
          },
          required: [],
        },
        items: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        meta: TEMPLATE_METADATA_SCHEMA,
        portals: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        scripts: {
          type: 'object',
          map: {
            keys: {
              type: 'string',
            },
            values: TEMPLATE_SCRIPT_SCHEMA,
          },
          required: [],
        },
        type: makeConstStringSchema(ROOM_TYPE),
      },
      required: ['actors', 'flags', 'items', 'meta', 'portals', 'scripts', 'type'],
    },
    mods: {
      type: 'array',
      default: [],
      items: ROOM_MODIFIER_SCHEMA,
    },
  },
  required: ['base'],
};
