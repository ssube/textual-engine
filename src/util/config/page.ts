import { doesExist, mustExist } from '@apextoaster/js-utils';
import { createSchema } from '@apextoaster/js-yaml-schema';
import Ajv from 'ajv';
import { DEFAULT_SCHEMA, load } from 'js-yaml';

import { ConfigError } from '../../error/ConfigError';
import { CONFIG_SCHEMA, ConfigFile } from '../../model/file/Config';
import { splitPath } from '../string';

export async function loadConfig(url: string, doc = document): Promise<ConfigFile> {
  const { path } = splitPath(url);
  const elem = doc.getElementById(path);
  const text = mustExist(elem).textContent;

  const schema = createSchema({
    include: {
      exists: (it) => doesExist(doc.getElementById(it)),
      join: (...it) => it.join('-'),
      read: (it) => {
        const readElem = mustExist(doc.getElementById(it));
        return mustExist(readElem.textContent);
      },
      resolve: (it) => it,
      schema: DEFAULT_SCHEMA,
    },
  });

  try {
    const data = load(mustExist(text), {
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
