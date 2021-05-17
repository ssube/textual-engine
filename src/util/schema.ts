import { JSONSchemaType } from 'ajv';

import { TemplateString } from '../model/meta/Template';

/**
 * @todo: make this typesafe for literal string types
 */
export function makeConstStringSchema<TValue extends string>(value: TValue): JSONSchemaType<TemplateString> {
  return {
    type: 'object',
    properties: {
      base: {
        type: 'string',
        default: value,
      },
      type: {
        type: 'string',
        default: 'string',
      },
    },
    required: ['base', 'type'],
    default: {
      type: 'string',
      base: value,
    },
  };
}
