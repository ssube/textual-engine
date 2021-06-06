import { JSONSchemaType } from 'ajv';
import { LogLevel } from 'noicejs';
import { Writable } from 'stream';

import { LOCALE_SCHEMA, LocaleBundle } from './Locale';

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

export interface ConfigServiceRef<TData = Record<string, string>> {
  data?: TData;
  kind: string;
  name: string;
}

export interface ConfigServices {
  actors: Array<ConfigServiceRef>;
  loaders: Array<ConfigServiceRef>;
  // locales: Array<ConfigServiceRef>;
  renders: Array<ConfigServiceRef>;
  states: Array<ConfigServiceRef>;
}

export interface ConfigFile {
  logger: ConfigLogger;
  locale: LocaleBundle & {
    current: string;
  };
  services: ConfigServices;
}

export const CONFIG_SERVICE_SCHEMA: JSONSchemaType<ConfigServiceRef> = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      nullable: true,
      patternProperties: {
        '.+': {
          type: 'string',
        },
      },
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

      },
      required: ['actors', 'loaders', 'renders', 'states'],
    },
  },
  required: [
    'locale',
    'logger',
    'services'
  ],
};
