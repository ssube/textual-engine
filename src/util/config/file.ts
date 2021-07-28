import { mustExist } from '@apextoaster/js-utils';
import { promises } from 'fs';
import { load } from 'js-yaml';

import { ConfigError } from '../../error/ConfigError.js';
import { ConfigFile } from '../../model/file/Config.js';
import { DATA_SCHEMA } from '../../model/file/Data.js';
import { makeParserSchema } from '../parser/index.js';
import { makeSchema } from '../schema/index.js';

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

  const schema = makeParserSchema();

  try {
    const data = load(dataStr, {
      schema,
    });

    const validate = makeSchema(DATA_SCHEMA);
    if (validate(data)) {
      return mustExist(data.config);
    } else {
      console.error(validate.errors);
      throw new ConfigError('invalid config data');
    }
  } catch (err) {
    throw new ConfigError('could not load config file', err);
  }
}
