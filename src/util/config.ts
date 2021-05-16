import { createSchema } from '@apextoaster/js-yaml-schema';
import Ajv, { JSONSchemaType } from 'ajv';
import { LogLevel } from 'bunyan';
import { existsSync, promises, readFileSync } from 'fs';
import { DEFAULT_SCHEMA, load } from 'js-yaml';
import { join } from 'path';
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

/**
 * Specialized config-loading function.
 *
 * This creates its own YAML parser (and schema) and does not use the Loader/Parser service
 * infrastructure found elsewhere in the code, because it informs their creation.
 */
export async function loadConfig(path: string): Promise<ConfigData> {
  const dataStr = await promises.readFile(path, {
    encoding: 'utf-8',
  });

  const schema = createSchema({
    include: {
      exists: existsSync,
      join,
      read: readFileSync,
      resolve: (path) => path,
      schema: DEFAULT_SCHEMA,
    },
  });
  const data = load(dataStr, {
    schema,
  });

  const validate = new Ajv().compile(CONFIG_SCHEMA);
  if (validate(data)) {
    return data;
  } else {
    console.error(validate.errors);
    throw new Error('invalid config data type');
  }
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
