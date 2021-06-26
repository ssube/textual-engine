import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants';
import { makeConstStringSchema } from '../../util/schema';
import { NumberMap, StringMap } from '../../util/types';
import { Modifier, MODIFIER_METADATA_SCHEMA } from '../mapped/Modifier';
import {
  BaseTemplate,
  Template,
  TEMPLATE_NUMBER_SCHEMA,
  TEMPLATE_SCRIPT_SCHEMA,
  TEMPLATE_STRING_SCHEMA,
} from '../mapped/Template';
import { Metadata, TEMPLATE_METADATA_SCHEMA } from '../Metadata';
import { ScriptMap } from '../Script';
import { Entity } from './Base';

export enum PortalLinkage {
  FORWARD = 'forward',
  BOTH = 'both',
}

export const PORTAL_TYPE = 'portal' as const;

export type PortalType = typeof PORTAL_TYPE;

export interface Portal {
  /**
   * The destination room.
   */
  dest: string;

  flags: StringMap;

  group: {
    key: string;
    source: string;
    target: string;
  };

  link: PortalLinkage;

  meta: Metadata;

  scripts: ScriptMap;

  // TODO: can these be removed in favor of flags?
  stats: NumberMap;

  type: PortalType;
}

export type PortalGroups = Map<string, {
  dests: Set<string>;
  portals: Set<BaseTemplate<Portal>>;
}>;

export function isPortal(it: Optional<Entity>): it is Portal {
  return doesExist(it) && it.type === PORTAL_TYPE;
}

export const PORTAL_MODIFIER_SCHEMA: JSONSchemaType<Modifier<Portal>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        dest: {
          ...TEMPLATE_STRING_SCHEMA,
          nullable: true,
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
        group: {
          type: 'object',
          nullable: true,
          properties: {
            key: TEMPLATE_STRING_SCHEMA,
            source: TEMPLATE_STRING_SCHEMA,
            target: TEMPLATE_STRING_SCHEMA,
          },
          required: ['key', 'source', 'target'],
        },
        link: {
          ...TEMPLATE_STRING_SCHEMA,
          nullable: true,
          default: {
            base: 'both',
            type: 'string',
          },
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
          ...makeConstStringSchema(PORTAL_TYPE),
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

export const PORTAL_TEMPLATE_SCHEMA: JSONSchemaType<Template<Portal>> = {
  type: 'object',
  properties: {
    base: {
      type: 'object',
      properties: {
        dest: TEMPLATE_STRING_SCHEMA,
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
        group: {
          type: 'object',
          properties: {
            key: TEMPLATE_STRING_SCHEMA,
            source: TEMPLATE_STRING_SCHEMA,
            target: TEMPLATE_STRING_SCHEMA,
          },
          required: ['key', 'source', 'target'],
        },
        link: {
          ...TEMPLATE_STRING_SCHEMA,
          default: {
            base: 'both',
            type: 'string',
          },
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
        type: makeConstStringSchema(PORTAL_TYPE),
      },
      required: ['dest', 'flags', 'group', 'meta', 'scripts', 'stats'],
    },
    mods: {
      type: 'array',
      default: [],
      items: PORTAL_MODIFIER_SCHEMA,
    },
  },
  required: ['base'],
};
