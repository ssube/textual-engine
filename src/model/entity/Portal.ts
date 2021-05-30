import { JSONSchemaType } from 'ajv';

import { BaseTemplate, TEMPLATE_STRING_SCHEMA } from '../mapped/Template';

export enum PortalLinkage {
  FORWARD = 'forward',
  BOTH = 'both',
}

export interface Portal {
  /**
   * The portal display name.
   */
  name: string;

  /**
   * The source portal's group.
   */
  sourceGroup: string;

  /**
   * The target group in the destination room.
   */
  targetGroup: string;

  /**
   * The destination room.
   */
  dest: string;

  link: PortalLinkage;
}

export type PortalGroups = Map<string, {
  dests: Set<string>;
  portals: Set<BaseTemplate<Portal>>;
}>;

export const PORTAL_SCHEMA: JSONSchemaType<BaseTemplate<Portal>> = {
  type: 'object',
  properties: {
    dest: TEMPLATE_STRING_SCHEMA,
    link: {
      ...TEMPLATE_STRING_SCHEMA,
      default: {
        base: 'both',
        type: 'string',
      },
    },
    name: TEMPLATE_STRING_SCHEMA,
    sourceGroup: TEMPLATE_STRING_SCHEMA,
    targetGroup: TEMPLATE_STRING_SCHEMA,
  },
  required: ['name', 'dest', 'sourceGroup', 'targetGroup'],
};
