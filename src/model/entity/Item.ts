import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants.js';
import { makeConstStringSchema } from '../../util/schema/index.js';
import { Immutable, NumberMap, StringMap } from '../../util/types.js';
import { Modifier, MODIFIER_METADATA_SCHEMA } from '../mapped/Modifier.js';
import { Template, TEMPLATE_NUMBER_SCHEMA, TEMPLATE_SCRIPT_SCHEMA, TEMPLATE_STRING_SCHEMA } from '../mapped/Template.js';
import { Metadata, TEMPLATE_METADATA_SCHEMA } from '../Metadata.js';
import { ScriptMap } from '../Script.js';
import { Entity } from './Base.js';

export const ITEM_TYPE = 'item' as const;

export type ItemType = typeof ITEM_TYPE;

export interface Item {
  flags: StringMap;
  meta: Metadata;
  scripts: ScriptMap;
  slot: string;
  stats: NumberMap;
  type: ItemType;
}

export type ReadonlyItem = Immutable<Item>;

export function isItem(entity: Optional<Immutable<Entity>>): entity is ReadonlyItem;
export function isItem(entity: Optional<Entity>): entity is Item;
export function isItem(entity: Optional<Entity>): entity is Item {
  return doesExist(entity) && entity.type === ITEM_TYPE;
}

export const ITEM_MODIFIER_SCHEMA: JSONSchemaType<Modifier<Item>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
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
        meta: {
          ...MODIFIER_METADATA_SCHEMA,
          nullable: true,
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
        slot: {
          ...TEMPLATE_STRING_SCHEMA,
          nullable: true,
        },
        stats: {
          type: 'object',
          nullable: true,
          map: {
            keys: {
              type: 'string',
            },
            values: TEMPLATE_NUMBER_SCHEMA,
          },
          required: [],
        },
        type: {
          ...makeConstStringSchema(ITEM_TYPE),
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

export const ITEM_TEMPLATE_SCHEMA: JSONSchemaType<Template<Item>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
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
        meta: TEMPLATE_METADATA_SCHEMA,
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
        slot: TEMPLATE_STRING_SCHEMA,
        stats: {
          type: 'object',
          map: {
            keys: {
              type: 'string',
            },
            values: TEMPLATE_NUMBER_SCHEMA,
          },
          required: [],
        },
        type: makeConstStringSchema(ITEM_TYPE),
      },
      required: ['flags', 'meta', 'scripts', 'slot', 'stats', 'type'],
    },
    mods: {
      type: 'array',
      default: [],
      items: ITEM_MODIFIER_SCHEMA,
    },
  },
  required: ['base'],
};
