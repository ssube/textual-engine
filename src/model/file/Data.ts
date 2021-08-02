import { JSONSchemaType } from 'ajv';

import { WorldState, WORLD_STATE_SCHEMA } from '../world/State.js';
import { WorldTemplate, WORLD_TEMPLATE_SCHEMA } from '../world/Template.js';
import { ConfigFile, CONFIG_SCHEMA } from './Config.js';

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
