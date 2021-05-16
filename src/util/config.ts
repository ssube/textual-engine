import { isNil } from '@apextoaster/js-utils';
import { LoggerOptions } from 'bunyan';
import { existsSync, promises, readFileSync } from 'fs';
import { DEFAULT_SCHEMA, load } from 'js-yaml';

import { createSchema } from '@apextoaster/js-yaml-schema';
import { join } from 'path';

export interface ConfigData {
  logger: LoggerOptions;
  locale: {};
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

  if (typeof data !== 'object' || isNil(data)) {
    throw new Error('invalid config data type');
  }

  // verify

  return data as ConfigData;
}
