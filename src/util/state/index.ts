import { doesExist, mustCoalesce } from '@apextoaster/js-utils';

import { WorldEntity, WorldEntityType } from '../../model/entity';
import { Actor } from '../../model/entity/Actor';
import { Entity } from '../../model/entity/Base';
import { Room } from '../../model/entity/Room';
import { Metadata } from '../../model/Metadata';
import { WorldState } from '../../model/world/State';
import { DEFAULT_MATCHERS } from '../entity';
import { Immutable } from '../types';

export interface SearchMatchers {
  entity: (entity: Immutable<Entity>, search: Partial<SearchParams>, matchers?: SearchMatchers) => boolean;
  metadata: (entity: Immutable<Entity>, search: Partial<Metadata>) => boolean;
}

export interface SearchParams {
  actor: Partial<Metadata>;
  meta: Partial<Metadata>;
  room: Partial<Metadata>;
  type: WorldEntityType;

  matchers?: SearchMatchers;
}

/**
 * Search state for any matching entities, including actors and their inventories.
 */
export function searchState(state: WorldState, search: Partial<SearchParams>): Array<WorldEntity>;
export function searchState(state: Immutable<WorldState>, search: Partial<SearchParams>): Array<Immutable<WorldEntity>>;
export function searchState(state: Immutable<WorldState>, search: Partial<SearchParams>): Array<Immutable<WorldEntity>> {
  const matchers = mustCoalesce(search.matchers, DEFAULT_MATCHERS);
  const results: Array<Immutable<WorldEntity>> = [];

  for (const room of state.rooms) {
    if (doesExist(search.room) && matchers.metadata(room, search.room) === false) {
      continue;
    }

    if (matchers.entity(room, search, matchers)) {
      results.push(room);
    }

    for (const actor of room.actors) {
      if (doesExist(search.actor) && matchers.metadata(actor, search.actor) === false) {
        continue;
      }

      if (matchers.entity(actor, search, matchers)) {
        results.push(actor);
      }

      for (const item of actor.items) {
        if (matchers.entity(item, search, matchers)) {
          results.push(item);
        }
      }
    }

    for (const item of room.items) {
      if (matchers.entity(item, search, matchers)) {
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
export function findRoom(state: WorldState, search: Partial<SearchParams>): Array<Room> {
  const matchers = mustCoalesce(search.matchers, DEFAULT_MATCHERS);
  const results = new Set<Room>();

  for (const room of state.rooms) {
    if (doesExist(search.room) && matchers.metadata(room, search.room) === false) {
      continue;
    }

    for (const actor of room.actors) {
      if (doesExist(search.actor) && matchers.metadata(actor, search.actor) === false) {
        continue;
      }

      if (matchers.entity(actor, search, matchers)) {
        results.add(room);
      }
    }

    for (const item of room.items) {
      if (matchers.entity(item, search, matchers)) {
        results.add(room);
      }
    }
  }

  return Array.from(results);
}

/**
 * Find the room or actor that contains a particular item.
 *
 * @todo stop searching each room once it has been added
 */
export function findContainer(state: WorldState, search: Partial<SearchParams>): Array<Actor | Room> {
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

      if (matchers.entity(actor, search, matchers)) {
        results.add(room);
      }

      for (const item of actor.items) {
        if (matchers.entity(item, search, matchers)) {
          results.add(actor);
        }
      }
    }

    for (const item of room.items) {
      if (matchers.entity(item, search, matchers)) {
        results.add(room);
      }
    }
  }

  return Array.from(results);
}
