import Ajv, { JSONSchemaType } from 'ajv';

import { TemplateString } from '../model/mapped/Template';

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

export function makeSchema<TType>(type: JSONSchemaType<TType>) {
  return new Ajv({
    useDefaults: true,
  }).compile(type);
}
