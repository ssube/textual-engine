import { createSchema } from '@apextoaster/js-yaml-schema';
import Ajv from 'ajv';
import { existsSync, promises, readFileSync } from 'fs';
import { DEFAULT_SCHEMA, load } from 'js-yaml';
import { join } from 'path';

import { ConfigError } from '../../error/ConfigError';
import { CONFIG_SCHEMA, ConfigFile } from '../../model/file/Config';

/**
 * Specialized config-loading function.
 *
 * This creates its own YAML parser (and schema) and does not use the Loader/Parser service
 * infrastructure found elsewhere in the code, because it informs their creation.
 */
export async function loadConfig(path: string): Promise<ConfigFile> {
  const dataStr = await promises.readFile(path, {
    encoding: 'utf-8',
  });

  const schema = createSchema({
    include: {
      exists: existsSync,
      join,
      read: readFileSync,
      resolve: (it) => it,
      schema: DEFAULT_SCHEMA,
    },
  });

  try {
    const data = load(dataStr, {
      schema,
    });

    const validate = new Ajv().compile(CONFIG_SCHEMA);
    if (validate(data)) {
      return data;
    } else {
      console.error(validate.errors);
      throw new ConfigError('invalid config data');
    }
  } catch (err) {
    throw new ConfigError('could not load config file', err);
  }
}
