import { JSONSchemaType } from 'ajv';

export type LocaleLanguage = Record<string, Record<string, string>>;

export interface LocaleBundle {
  bundles: LocaleLanguage;
  words: {
    articles: Array<string>;
    prepositions: Array<string>;
    verbs: Array<string>;
  };
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
    words: {
      type: 'object',
      properties: {
        articles: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        prepositions: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        verbs: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['articles', 'prepositions', 'verbs'],
    },
  },
  required: ['bundles', 'words'],
};
