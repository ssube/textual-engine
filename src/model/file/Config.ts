import { JSONSchemaType } from 'ajv';
import { LogLevel } from 'noicejs';
import { Writable } from 'stream';

import { LocaleBundle, LOCALE_SCHEMA } from './Locale';

export interface ConfigLogger {
  level: LogLevel;
  name: string;
  streams: Array<{
    level: LogLevel;
    type: string;
    path: string;
    stream: Writable;
  }>;
}

export interface ConfigFile {
  logger: ConfigLogger;
  locale: LocaleBundle & {
    current: string;
  };
}

export const CONFIG_SCHEMA: JSONSchemaType<ConfigFile> = {
  type: 'object',
  properties: {
    logger: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        streams: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              level: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              path: {
                type: 'string',
              },
              stream: {
                type: 'object',
                required: [],
              },
            },
            required: [],
          },
        },
      },
      required: [
        'level',
        'name',
      ],
      additionalProperties: true,
    },
    locale: {
      type: 'object',
      properties: {
        ...LOCALE_SCHEMA.properties,
        current: {
          type: 'string',
          default: 'en',
        },
      },
      required: ['bundles'],
    },
  },
  required: [
    'locale',
    'logger',
  ],
};
