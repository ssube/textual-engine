import { doesExist } from '@apextoaster/js-utils';

import { WorldEntity, WorldEntityType } from '../../model/entity';
import { Entity } from '../../model/entity/Base';
import { Metadata } from '../../model/meta/Metadata';
import { State } from '../../model/State';
import { DEFAULT_MATCHERS } from '../entity';
import { Immutable } from '../types';

export interface SearchMatchers {
  entity: (entity: Immutable<Entity>, search: Partial<SearchParams>, matchers?: SearchMatchers) => boolean;
  metadata: (entity: Immutable<Entity>, search: Partial<Metadata>) => boolean;
}

export interface SearchParams {
  meta: Partial<Metadata>;
  room: Partial<Metadata>;
  type: WorldEntityType;
}

/**
 * Search state for any matching entities, including actors and their inventories.
 */
export function searchState(state: State, search: Partial<SearchParams>, matchers?: SearchMatchers): Array<WorldEntity>;
export function searchState(state: Immutable<State>, search: Partial<SearchParams>, matchers?: SearchMatchers): Array<Immutable<WorldEntity>>;
export function searchState(state: Immutable<State>, search: Partial<SearchParams>, matchers = DEFAULT_MATCHERS): Array<Immutable<WorldEntity>> {
  const results: Array<Immutable<WorldEntity>> = [];

  for (const room of state.rooms) {
    if (doesExist(search.room) && matchers.metadata(room, search.room) === false) {
      continue;
    }

    if (matchers.entity(room, search, matchers)) {
      results.push(room);
    }

    for (const actor of room.actors) {
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
