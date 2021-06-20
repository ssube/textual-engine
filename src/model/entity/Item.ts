import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { makeConstStringSchema } from '../../util/schema';
import { NumberMap, ScriptMap } from '../../util/types';
import { Template, TEMPLATE_STRING_SCHEMA } from '../mapped/Template';
import { Metadata, TEMPLATE_METADATA_SCHEMA } from '../Metadata';
import { Entity } from './Base';

export const ITEM_TYPE = 'item' as const;

export type ItemType = typeof ITEM_TYPE;

export interface Item {
  meta: Metadata;
  scripts: ScriptMap;
  slot: string;
  stats: NumberMap;
  type: ItemType;
}

export function isItem(entity: Optional<Entity>): entity is Item {
  return doesExist(entity) && entity.type === ITEM_TYPE;
}

export const ITEM_TEMPLATE_SCHEMA: JSONSchemaType<Template<Item>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        meta: TEMPLATE_METADATA_SCHEMA,
        scripts: {
          type: 'object',
          required: [],
        },
        slot: TEMPLATE_STRING_SCHEMA,
        stats: {
          type: 'object',
          required: [],
        },
        type: makeConstStringSchema(ITEM_TYPE),
      },
      required: ['meta', 'scripts', 'slot', 'stats', 'type'],
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
