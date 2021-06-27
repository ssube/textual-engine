import { JSONSchemaType } from 'ajv';

import { WorldState, WORLD_STATE_SCHEMA } from '../world/State';
import { WorldTemplate, WORLD_TEMPLATE_SCHEMA } from '../world/Template';
import { ConfigFile, CONFIG_SCHEMA } from './Config';

export interface DataFile {
  config?: ConfigFile;
  state?: WorldState;
  worlds?: Array<WorldTemplate>;
}

export const DATA_SCHEMA: JSONSchemaType<DataFile> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    config: {
      ...CONFIG_SCHEMA,
      nullable: true,
    },
    state: {
      ...WORLD_STATE_SCHEMA,
      nullable: true,
    },
    worlds: {
      type: 'array',
      items: WORLD_TEMPLATE_SCHEMA,
      nullable: true,
    },
  },
  required: [],
};
