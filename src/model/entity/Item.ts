import { JSONSchemaType } from 'ajv';
import { makeConstStringSchema } from '../../util/schema';

import { SlotMap, StatMap, VerbMap } from '../../util/types';
import { Metadata, METADATA_SCHEMA } from '../meta/Metadata';
import { Template } from '../meta/Template';
import { Entity } from './Base';

export const ITEM_TYPE = 'item';

export interface Item {
  type: typeof ITEM_TYPE;
  meta: Metadata,
  slots: SlotMap;
  stats: StatMap;
  verbs: VerbMap;
}

export function isItem(entity: Entity): entity is Item {
  return entity.type === ITEM_TYPE;
}

export const ITEM_SCHEMA: JSONSchemaType<Template<Item>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        type: makeConstStringSchema(ITEM_TYPE),
        meta: METADATA_SCHEMA,
        slots: {
          type: 'object',
          required: [],
        },
        stats: {
          type: 'object',
          required: [],
        },
        verbs: {
          type: 'object',
          required: [],
        },
      },
      required: ['meta', 'slots', 'stats', 'type', 'verbs'],
    },
  },
  required: ['base'],
};
