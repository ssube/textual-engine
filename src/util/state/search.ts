import { doesExist, mustCoalesce } from '@apextoaster/js-utils';

import { WorldEntity, WorldEntityType } from '../../model/entity';
import { Actor } from '../../model/entity/Actor';
import { Entity } from '../../model/entity/Base';
import { isRoom, Room, ROOM_TYPE } from '../../model/entity/Room';
import { Metadata } from '../../model/Metadata';
import { WorldState } from '../../model/world/State';
import { DEFAULT_MATCHERS } from '../entity';
import { Immutable } from '../types';

export interface StateMatchers {
  entity: (entity: Immutable<Entity>, search: SearchFilter) => boolean;
  metadata: (entity: Immutable<Entity>, search: Partial<Metadata>) => boolean;
}

export interface SearchFilter {
  actor?: Partial<Metadata>;
  meta?: Partial<Metadata>;
  room?: Partial<Metadata>;

  /**
   * @todo infer and specialize results
   */
  type?: WorldEntityType;

  matchers?: StateMatchers;
}

/**
 * Search state for any matching entities, including actors and their inventories.
 */
export function findMatching(state: WorldState, search: SearchFilter): Array<WorldEntity> {
  const matchers = mustCoalesce(search.matchers, DEFAULT_MATCHERS);
  const results: Array<WorldEntity> = [];

  for (const room of state.rooms) {
    if (doesExist(search.room) && matchers.metadata(room, search.room) === false) {
      continue;
    }

    if (matchers.entity(room, search)) {
      results.push(room);
    }

    for (const actor of room.actors) {
      if (doesExist(search.actor) && matchers.metadata(actor, search.actor) === false) {
        continue;
      }

      if (matchers.entity(actor, search)) {
        results.push(actor);
      }

      for (const item of actor.items) {
        if (matchers.entity(item, search)) {
          results.push(item);
        }
      }
    }

    for (const item of room.items) {
      if (matchers.entity(item, search)) {
        results.push(item);
      }
    }
  }

  return results;
}

/**
 * Find the room that contains a particular entity.
 *
 * @todo stop searching each room once it has been added
 */
export function findRoom(state: WorldState, search: SearchFilter): Array<Room> {
  const results = findContainer(state, search);
  // this has to use the filter and guard, because adding type to the search does not work for containers
  return results.filter(isRoom);
}

/**
 * Find the room or actor that contains a particular item.
 *
 * @todo stop searching each room once it has been added
 */
export function findContainer(state: WorldState, search: SearchFilter): Array<Actor | Room> {
  const matchers = mustCoalesce(search.matchers, DEFAULT_MATCHERS);
  const results = new Set<Actor | Room>();

  for (const room of state.rooms) {
    if (doesExist(search.room) && matchers.metadata(room, search.room) === false) {
      continue;
    }

    for (const actor of room.actors) {
      if (doesExist(search.actor) && matchers.metadata(actor, search.actor) === false) {
        continue;
      }

      if (matchers.entity(actor, search)) {
        results.add(room);
      }

      for (const item of actor.items) {
        if (matchers.entity(item, search)) {
          results.add(actor);
        }
      }
    }

    for (const item of room.items) {
      if (matchers.entity(item, search)) {
        results.add(room);
      }
    }
  }

  return Array.from(results);
}
