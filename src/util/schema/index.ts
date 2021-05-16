import { JSONSchemaType } from "ajv";
import { TemplateString } from "../../model/meta/Template";

/**
 * @todo: make this typesafe for literal string types
 */
export function makeConstStringSchema<T extends string>(value: T): JSONSchemaType<TemplateString<string>> {
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
};
