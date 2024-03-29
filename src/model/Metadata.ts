import { JSONSchemaType } from 'ajv';

import { TEMPLATE_STRING_SCHEMA, TemplateMetadata } from './mapped/Template.js';

export interface Metadata {
  desc: string;
  id: string;
  name: string;
  template: string;
}

export const TEMPLATE_METADATA_SCHEMA: JSONSchemaType<TemplateMetadata> = {
  type: 'object',
  properties: {
    desc: TEMPLATE_STRING_SCHEMA,
    id: {
      type: 'string',
    },
    name: TEMPLATE_STRING_SCHEMA,
  },
  required: ['desc', 'id', 'name'],
};
