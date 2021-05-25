import { JSONSchemaType } from 'ajv';

export type LocaleLanguage = Record<string, Record<string, string>>;

export interface LocaleBundle {
  bundles: LocaleLanguage;
}

export const LOCALE_SCHEMA: JSONSchemaType<LocaleBundle> = {
  type: 'object',
  properties: {
    bundles: {
      type: 'object',
      required: [],
      additionalProperties: true,
      patternProperties: {
        '.*': {
          type: 'object',
          required: [],
        },
      },
    },
  },
  required: ['bundles'],
};
