import { Actor } from './entity/Actor';
import { Item } from './entity/Item';
import { Room } from './entity/Room';
import { Metadata } from './meta/Metadata';
import { Template } from './meta/Template';

export interface World {
  /**
   * World name, description, and other metadata (subrecord common to most entities).
   */
  meta: Metadata;

  /**
   * Starting rooms and character selection.
   * 
   * @todo needs a better name
   */
  start: {
    actors: Array<string>;
    rooms: Array<string>;
  };

  templates: {
    actors: Array<Template<Actor>>;
    items: Array<Template<Item>>;
    rooms: Array<Template<Room>>;
  }

  /**
   * Conversations.
   */
  dialogue: Array<unknown>;

  scripts: Array<unknown>;
}
