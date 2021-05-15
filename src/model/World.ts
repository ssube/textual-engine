import { Actor } from './entity/Actor';
import { Item } from './entity/Item';
import { Room } from './entity/Room';
import { Metadata } from './meta/Metadata';
import { Template } from './meta/Template';

export interface World {
  /**
   * World name, description, and other metadata (common to most entities).
   */
  meta: Metadata;

  /**
   * Starting rooms and character selection.
   * 
   * @todo is there a better name? spawn?
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
}
