import { JSONSchemaType } from 'ajv';

import { State, STATE_SCHEMA } from '../../model/State';
import { World, WORLD_SCHEMA } from '../../model/World';

export interface DataFile {
  states: Array<State>;
  worlds: Array<World>;
}

export interface Parser {
  load(data: string): DataFile;
  save(data: DataFile): string;
}

export const DATA_SCHEMA: JSONSchemaType<DataFile> = {
  type: 'object',
  properties: {
    states: {
      type: 'array',
      items: STATE_SCHEMA,
    },
    worlds: {
      type: 'array',
      items: WORLD_SCHEMA,
    },
  },
  required: ['states', 'worlds'],
};
