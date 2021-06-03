import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { makeConstStringSchema } from '../../util/schema';
import { ScriptMap, StatMap } from '../../util/types';
import { Template } from '../mapped/Template';
import { Metadata, METADATA_SCHEMA } from '../Metadata';
import { Entity } from './Base';

export const ITEM_TYPE = 'item' as const;

export interface Item {
  type: typeof ITEM_TYPE;
  meta: Metadata;
  scripts: ScriptMap;
  stats: StatMap;
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
        type: makeConstStringSchema(ITEM_TYPE),
        meta: METADATA_SCHEMA,
        scripts: {
          type: 'object',
          required: [],
        },
        stats: {
          type: 'object',
          required: [],
        },
      },
      required: ['meta', 'scripts', 'stats', 'type'],
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
