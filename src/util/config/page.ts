import { mustExist } from '@apextoaster/js-utils';
import { load } from 'js-yaml';

import { ConfigError } from '../../error/ConfigError';
import { ConfigFile } from '../../model/file/Config';
import { DATA_SCHEMA } from '../../model/file/Data';
import { makeParserSchema } from '../parser';
import { makeSchema } from '../schema';
import { splitPath } from '../string';

export async function loadConfig(url: string, /* istanbul ignore next */ doc = document): Promise<ConfigFile> {
  const { path } = splitPath(url);
  const elem = doc.getElementById(path);
  const text = mustExist(elem).textContent;

  const schema = makeParserSchema();

  try {
    const data = load(mustExist(text), {
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
