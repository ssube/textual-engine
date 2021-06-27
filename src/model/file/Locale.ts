import { JSONSchemaType } from 'ajv';

interface NestedRecord {
  [key: string]: NestedString;
}

export type NestedString = string | NestedRecord;

export interface LocaleBundle {
  current?: string;
  languages: Record<string, {
    articles: Array<string>;
    prepositions: Array<string>;
    strings: Record<string, NestedString>;
    verbs: Array<string>;
  }>;
}

export const LOCALE_SCHEMA: JSONSchemaType<LocaleBundle> = {
  type: 'object',
  properties: {
    current: {
      type: 'string',
      nullable: true,
    },
    languages: {
      type: 'object',
      required: [],
      additionalProperties: true,
      patternProperties: {
        '.*': {
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
            strings: {
              type: 'object',
              required: [],
            },
            verbs: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['articles', 'prepositions', 'strings', 'verbs'],
        },
      },
    },
  },
  required: ['languages'],
};
