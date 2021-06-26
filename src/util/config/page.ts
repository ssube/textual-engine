import { mustExist } from '@apextoaster/js-utils';
import { load } from 'js-yaml';

import { ConfigError } from '../../error/ConfigError';
import { CONFIG_SCHEMA, ConfigFile } from '../../model/file/Config';
import { makeParserSchema } from '../parser';
import { makeSchema } from '../schema';
import { splitPath } from '../string';

/* istanbul ignore else */
export async function loadConfig(url: string, doc = document): Promise<ConfigFile> {
  const { path } = splitPath(url);
  const elem = doc.getElementById(path);
  const text = mustExist(elem).textContent;

  const schema = makeParserSchema();

  try {
    const data = load(mustExist(text), {
      schema,
    });

    const validate = makeSchema(CONFIG_SCHEMA);
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
