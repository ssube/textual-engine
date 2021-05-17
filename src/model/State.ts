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
  /**
   * The world template from which this state was created.
   */
  world: {
    /**
     * The template name.
     */
    name: string;

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
   * @todo remove
   */
  input: Map<string, Array<string>>;

  /**
   * The root of the entity tree.
   */
  rooms: Array<Room>;

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
    world: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        seed: {
          type: 'string',
        },
      },
      required: ['seed', 'name'],
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
  },
  required: ['world', 'focus', 'input', 'rooms', 'step'],
};
