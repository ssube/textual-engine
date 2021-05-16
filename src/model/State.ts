import { JSONSchemaType } from 'ajv';

import { Room } from './entity/Room';

export enum ReactionConfig {
  PLAYER_FIRST = 'player',
  REACTION_STAT = 'reaction',
}

export enum SidebarConfig {
  NEVER_OPEN = 'never',
  ALWAYS_OPEN = 'always',
}

/**
 * A saved world state.
 */
export interface State {
  config: {
    reaction: ReactionConfig;
    seed: string;
    sidebar: SidebarConfig;
    world: string;
  };

  focus: {
    actor: string;
    room: string;
  };

  input: Map<string, Array<string>>;
  rooms: Array<Room>;
}

export const STATE_SCHEMA: JSONSchemaType<State> = {
  type: 'object',
  properties: {
    config: {
      type: 'object',
      properties: {
        reaction: {
          type: 'string',
        },
        seed: {
          type: 'string',
        },
        sidebar: {
          type: 'string',
        },
        world: {
          type: 'string',
        },
      },
      required: ['reaction', 'seed', 'sidebar', 'world'],
    },
    focus: {
      type: 'object',
      properties: {
        actor: {
          type: 'string',
        },
        room: {
          type: 'string',
        },
      },
      required: ['actor', 'room'],
    },
    input: {
      type: 'object',
      required: [],
    },
    rooms: {
      type: 'array',
      items: {
        type: 'object',
        required: [],
      }
    },
  },
  required: ['config', 'focus', 'input', 'rooms'],
};
