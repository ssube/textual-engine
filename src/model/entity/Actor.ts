import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants';
import { makeConstStringSchema } from '../../util/schema';
import { NumberMap, StringMap } from '../../util/types';
import { Modifier, MODIFIER_METADATA_SCHEMA } from '../mapped/Modifier';
import {
  Template,
  TEMPLATE_NUMBER_SCHEMA,
  TEMPLATE_REF_SCHEMA,
  TEMPLATE_SCRIPT_SCHEMA,
  TEMPLATE_STRING_SCHEMA,
} from '../mapped/Template';
import { Metadata, TEMPLATE_METADATA_SCHEMA } from '../Metadata';
import { ScriptMap } from '../Script';
import { Entity } from './Base';
import { Item } from './Item';

export enum ActorSource {
  BEHAVIOR = 'behavior',
  PLAYER = 'player',
  REMOTE = 'remote',
}

export const ACTOR_TYPE = 'actor' as const;

export type ActorType = typeof ACTOR_TYPE;

export interface Actor {
  flags: StringMap;
  items: Array<Item>;
  meta: Metadata;
  scripts: ScriptMap;
  slots: StringMap;
  source: ActorSource;
  stats: NumberMap;
  type: ActorType;
}

export function isActor(entity: Optional<Entity>): entity is Actor {
  return doesExist(entity) && entity.type === ACTOR_TYPE;
}

export const ACTOR_MODIFIER_SCHEMA: JSONSchemaType<Modifier<Actor>> = {
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
        items: {
          type: 'array',
          nullable: true,
          items: TEMPLATE_REF_SCHEMA,
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
        slots: {
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
        source: {
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
          ...makeConstStringSchema(ACTOR_TYPE),
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

export const ACTOR_TEMPLATE_SCHEMA: JSONSchemaType<Template<Actor>> = {
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
        items: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
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
        slots: {
          type: 'object',
          map: {
            keys: {
              type: 'string',
            },
            values: TEMPLATE_STRING_SCHEMA,
          },
          required: [],
        },
        source: TEMPLATE_STRING_SCHEMA,
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
        type: makeConstStringSchema(ACTOR_TYPE),
      },
      required: ['flags', 'items', 'meta', 'type', 'scripts', 'stats'],
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
