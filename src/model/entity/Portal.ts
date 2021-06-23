import { doesExist, Optional } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants';
import { Modifier, MODIFIER_METADATA_SCHEMA } from '../mapped/Modifier';
import { BaseTemplate, Template, TEMPLATE_SCRIPT_SCHEMA, TEMPLATE_STRING_SCHEMA } from '../mapped/Template';
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

  groupKey: string;

  /**
   * The source portal's group.
   */
  groupSource: string;

  /**
   * The target group in the destination room.
   */
  groupTarget: string;

  link: PortalLinkage;

  meta: Metadata;

  scripts: ScriptMap;

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
        dest: TEMPLATE_STRING_SCHEMA,
        groupKey: TEMPLATE_STRING_SCHEMA,
        groupSource: TEMPLATE_STRING_SCHEMA,
        groupTarget: TEMPLATE_STRING_SCHEMA,
        link: {
          ...TEMPLATE_STRING_SCHEMA,
          default: {
            base: 'both',
            type: 'string',
          },
        },
        meta: MODIFIER_METADATA_SCHEMA,
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
        type: {
          type: 'object',
          properties: {
            base: {
              default: PORTAL_TYPE,
              type: 'string',
            },
            type: {
              default: 'string',
              type: 'string',
            },
          },
          required: ['base', 'type'],
        },
      },
      required: ['dest', 'groupKey', 'groupSource', 'groupTarget', 'meta', 'scripts'],
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
        groupKey: TEMPLATE_STRING_SCHEMA,
        groupSource: TEMPLATE_STRING_SCHEMA,
        groupTarget: TEMPLATE_STRING_SCHEMA,
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
        type: {
          type: 'object',
          properties: {
            base: {
              default: PORTAL_TYPE,
              type: 'string',
            },
            type: {
              default: 'string',
              type: 'string',
            },
          },
          required: ['base', 'type'],
        },
      },
      required: ['dest', 'groupKey', 'groupSource', 'groupTarget', 'meta', 'scripts'],
    },
    mods: {
      type: 'array',
      default: [],
      items: PORTAL_MODIFIER_SCHEMA,
    },
  },
  required: ['base'],
};
