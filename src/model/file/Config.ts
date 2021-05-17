import { JSONSchemaType } from 'ajv';
import { LogLevel } from 'noicejs';
import { Writable } from 'stream';

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

export interface ConfigLocale {
  /**
    * Turn prompt.
    */
  prompt: string;

  verbs: { // known verbs
    common: {
      look: string;
      move: string;
      take: string;
      use: string;
      wait: string;
    };
    meta: {
      debug: string;
      graph: string;
      help: string;
      quit: string;
    };
  };
}

export interface ConfigData {
  logger: ConfigLogger;
  locale: ConfigLocale;
}

export const CONFIG_SCHEMA: JSONSchemaType<ConfigData> = {
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
      required: [],
    },
  },
  required: [
    'locale',
    'logger',
  ],
};
