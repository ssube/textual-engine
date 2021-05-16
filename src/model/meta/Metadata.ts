import { JSONSchemaType } from 'ajv';

import { BaseTemplate, TEMPLATE_STRING_SCHEMA } from './Template';

export interface Metadata {
  desc: string;
  id: string;
  name: string;
  template: string;
}

export type BareMetadata = Omit<Metadata, 'template'>;

export const METADATA_SCHEMA: JSONSchemaType<BaseTemplate<BareMetadata>> = {
  type: 'object',
  properties: {
    desc: TEMPLATE_STRING_SCHEMA,
    id: TEMPLATE_STRING_SCHEMA,
    name: TEMPLATE_STRING_SCHEMA,
  },
  required: ['desc', 'id', 'name'],
};
