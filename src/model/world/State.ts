import { JSONSchemaType } from 'ajv';

import { Room } from '../entity/Room';
import { Metadata } from '../Metadata';

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
export interface WorldState {
  meta: Metadata;

  /**
   * The world template from which this state was created.
   */
  world: {
    /**
     * The depth to generate rooms and portals when focus changes.
     */
    depth: number;

    id: string;

    /**
     * The random generator's seed.
     */
    seed: string;
  };

  /**
   * The root of the entity tree.
   */
  rooms: Array<Room>;

  /**
   * The starting room and actor, for respawning.
   */
  start: {
    room: string;
  };

  /**
   * The world progression, the index and time of the last step.
   */
  step: {
    time: number;
    turn: number;
  };
}

export const WORLD_STATE_SCHEMA: JSONSchemaType<WorldState> = {
  type: 'object',
  properties: {
    meta: {
      type: 'object',
      properties: {
        desc: {
          type: 'string',
        },
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        template: {
          type: 'string',
        },
      },
      required: ['desc', 'id', 'name', 'template'],
    },
    rooms: {
      type: 'array',
      items: {
        type: 'object',
        required: [],
      }
    },
    start: {
      type: 'object',
      properties: {
        room: {
          type: 'string',
        },
      },
      required: ['room'],
    },
    step: {
      type: 'object',
      properties: {
        time: {
          type: 'number',
        },
        turn: {
          type: 'number',
        },
      },
      required: ['time', 'turn'],
    },
    world: {
      type: 'object',
      properties: {
        depth: {
          type: 'number',
        },
        id: {
          type: 'string',
        },
        seed: {
          type: 'string',
        },
      },
      required: ['depth', 'id', 'seed'],
    },

  },
  required: ['meta', 'rooms', 'step', 'world'],
};
