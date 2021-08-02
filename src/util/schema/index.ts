import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';

import { TemplateString } from '../../model/mapped/Template.js';
import { KEYWORD_MAP } from './MapKeyword.js';

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

export function makeSchema<TType>(type: JSONSchemaType<TType>): ValidateFunction<TType> {
  const ajv = new Ajv({
    discriminator: true,
    keywords: [
      KEYWORD_MAP,
    ],
    useDefaults: true,
  });
  return ajv.compile(type);
}
