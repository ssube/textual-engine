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
  locale: LocaleBundle;
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
    locale: LOCALE_SCHEMA,
  },
  required: [
    'locale',
    'logger',
  ],
};
