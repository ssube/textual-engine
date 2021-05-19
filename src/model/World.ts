import { JSONSchemaType } from 'ajv';

import { Actor, ACTOR_SCHEMA } from './entity/Actor';
import { Item, ITEM_SCHEMA } from './entity/Item';
import { Room, ROOM_SCHEMA } from './entity/Room';
import { METADATA_SCHEMA } from './meta/Metadata';
import { Template, TemplateMetadata, TemplateRef, TEMPLATE_REF_SCHEMA } from './meta/Template';

export interface World {
  /**
   * World name, description, and other metadata (common to most entities).
   */
  meta: TemplateMetadata;

  /**
   * Starting rooms and character selection.
   */
  start: {
    actors: Array<TemplateRef>;
    rooms: Array<TemplateRef>;
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
    meta: METADATA_SCHEMA,
    start: {
      type: 'object',
      properties: {
        actors: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
        },
        rooms: {
          type: 'array',
          items: TEMPLATE_REF_SCHEMA,
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
