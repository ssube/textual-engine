import { JSONSchemaType } from 'ajv';
import { LogLevel } from 'noicejs';
import { Writable } from 'stream';

import { LOCALE_SCHEMA, LocaleBundle } from './Locale.js';

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

export interface ConfigServiceRef {
  // any needed for config schema below
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  kind: string;
  name: string;
}

export interface ConfigServices {
  actors: Array<ConfigServiceRef>;
  loaders: Array<ConfigServiceRef>;
  renders: Array<ConfigServiceRef>;
  states: Array<ConfigServiceRef>;
  tokenizers: Array<ConfigServiceRef>;
}

export interface ConfigFile {
  logger: ConfigLogger;
  locale: LocaleBundle;
  services: ConfigServices;
}

export const CONFIG_SERVICE_SCHEMA: JSONSchemaType<ConfigServiceRef> = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      nullable: true,
      required: [],
    },
    kind: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
  },
  required: ['kind', 'name'],
};

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
    services: {
      type: 'object',
      properties: {
        actors: {
          type: 'array',
          items: CONFIG_SERVICE_SCHEMA,
        },
        loaders: {
          type: 'array',
          items: CONFIG_SERVICE_SCHEMA,
        },
        renders: {
          type: 'array',
          items: CONFIG_SERVICE_SCHEMA,
        },
        states: {
          type: 'array',
          items: CONFIG_SERVICE_SCHEMA,
        },
        tokenizers: {
          type: 'array',
          items: CONFIG_SERVICE_SCHEMA,
        },
      },
      required: ['actors', 'loaders', 'renders', 'states', 'tokenizers'],
    },
  },
  required: [
    'locale',
    'logger',
    'services'
  ],
};
