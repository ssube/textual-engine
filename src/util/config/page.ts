import { mustExist } from '@apextoaster/js-utils';
import { load } from 'js-yaml';

import { ConfigError } from '../../error/ConfigError.js';
import { ConfigFile } from '../../model/file/Config.js';
import { DATA_SCHEMA } from '../../model/file/Data.js';
import { makeParserSchema } from '../parser/index.js';
import { makeSchema } from '../schema/index.js';
import { splitPath } from '../string.js';

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
    if (err instanceof Error) {
      throw new ConfigError('error loading config from page', err);
    } else {
      throw new ConfigError('unknown error loading config from page');
    }
  }
}
