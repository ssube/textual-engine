import { JSONSchemaType } from 'ajv';

import { Actor, ACTOR_TEMPLATE_SCHEMA } from '../entity/Actor';
import { Item, ITEM_TEMPLATE_SCHEMA } from '../entity/Item';
import { Portal, PORTAL_TEMPLATE_SCHEMA } from '../entity/Portal';
import { Room, ROOM_TEMPLATE_SCHEMA } from '../entity/Room';
import { LOCALE_SCHEMA, LocaleBundle } from '../file/Locale';
import { Template, TEMPLATE_REF_SCHEMA, TemplateMetadata, TemplateRef, BaseTemplate } from '../mapped/Template';
import { TEMPLATE_METADATA_SCHEMA } from '../Metadata';

export interface WorldTemplate {
  defaults: {
    actor: BaseTemplate<Actor>;
    item: BaseTemplate<Item>;
    portal: BaseTemplate<Portal>;
    room: BaseTemplate<Room>;
  };

  locale: LocaleBundle;

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
    portals: Array<Template<Portal>>;
    rooms: Array<Template<Room>>;
  };
}

export const WORLD_TEMPLATE_SCHEMA: JSONSchemaType<WorldTemplate> = {
  type: 'object',
  properties: {
    defaults: {
      type: 'object',
      properties: {
        actor: ACTOR_TEMPLATE_SCHEMA.properties.base,
        item: ITEM_TEMPLATE_SCHEMA.properties.base,
        portal: PORTAL_TEMPLATE_SCHEMA.properties.base,
        room: ROOM_TEMPLATE_SCHEMA.properties.base,
      },
      required: ['actor', 'item', 'portal', 'room'],
    },
    locale: LOCALE_SCHEMA,
    meta: TEMPLATE_METADATA_SCHEMA,
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
          items: ACTOR_TEMPLATE_SCHEMA,
        },
        items: {
          type: 'array',
          items: ITEM_TEMPLATE_SCHEMA,
        },
        portals: {
          type: 'array',
          items: PORTAL_TEMPLATE_SCHEMA,
        },
        rooms: {
          type: 'array',
          items: ROOM_TEMPLATE_SCHEMA,
        },
      },
      required: ['actors', 'items', 'portals', 'rooms'],
    },
  },
  required: ['defaults', 'locale', 'meta', 'start', 'templates'],
};
