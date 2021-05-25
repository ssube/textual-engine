import { JSONSchemaType } from 'ajv';

import { Room } from './entity/Room';
import { Metadata } from './Metadata';

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
  meta: Metadata;

  /**
   * The world template from which this state was created.
   */
  world: {
    /**
     * The depth to generate rooms and portals when focus changes.
     */
    depth: number;

    /**
     * The random generator's seed.
     */
    seed: string;
  };

  /**
   * The active room and actor, for filtering output.
   */
  focus: {
    actor: string;
    room: string;
  };

  /**
   * The root of the entity tree.
   */
  rooms: Array<Room>;

  /**
   * The starting room and actor, for respawning.
   */
  start: {
    actor: string;
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

export const STATE_SCHEMA: JSONSchemaType<State> = {
  type: 'object',
  properties: {
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
        actor: {
          type: 'string',
        },
        room: {
          type: 'string',
        },
      },
      required: ['actor', 'room'],
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
        seed: {
          type: 'string',
        },
      },
      required: ['depth', 'seed'],
    },

  },
  required: ['focus', 'meta', 'rooms', 'step', 'world'],
};
