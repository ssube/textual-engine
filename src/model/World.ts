import { JSONSchemaType } from 'ajv';

import { Actor, ACTOR_SCHEMA } from './entity/Actor';
import { Item, ITEM_SCHEMA } from './entity/Item';
import { Room, ROOM_SCHEMA } from './entity/Room';
import { Metadata } from './meta/Metadata';
import { Template } from './meta/Template';

export interface World {
  /**
   * World name, description, and other metadata (common to most entities).
   */
  meta: Metadata;

  /**
   * Starting rooms and character selection.
   */
  start: {
    actors: Array<string>;
    rooms: Array<string>;
  };

  templates: {
    actors: Array<Template<Actor>>;
    items: Array<Template<Item>>;
    rooms: Array<Template<Room>>;
  };
}

export const WORLD_SCHEMA: JSONSchemaType<World> = {
  type: 'object',
  properties: {
    meta: {
      type: 'object',
      required: [],
    },
    start: {
      type: 'object',
      properties: {
        actors: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        rooms: {
          type: 'array',
          items: {
            type: 'string',
          },
        }
      },
      required: ['actors', 'rooms'],
    },
    templates: {
      type: 'object',
      properties: {
        actors: {
          type: 'array',
          items: ACTOR_SCHEMA,
        },
        items: {
          type: 'array',
          items: ITEM_SCHEMA,
        },
        rooms: {
          type: 'array',
          items: ROOM_SCHEMA,
        },
      },
      required: ['actors', 'items', 'rooms'],
    },
  },
  required: ['meta', 'start', 'templates'],
};
