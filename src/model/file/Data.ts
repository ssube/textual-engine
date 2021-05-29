import { JSONSchemaType } from 'ajv';

import { State, STATE_SCHEMA } from '../State';
import { World, WORLD_SCHEMA } from '../World';
import { ConfigFile, CONFIG_SCHEMA } from './Config';

export interface DataFile {
  config?: ConfigFile;
  state?: State;
  worlds: Array<World>;
}

export const DATA_SCHEMA: JSONSchemaType<DataFile> = {
  type: 'object',
  properties: {
    config: {
      ...CONFIG_SCHEMA,
      nullable: true,
    },
    state: {
      ...STATE_SCHEMA,
      nullable: true,
    },
    worlds: {
      type: 'array',
      items: WORLD_SCHEMA,
    },
  },
  required: ['worlds'],
};
