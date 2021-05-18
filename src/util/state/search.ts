import { doesExist } from '@apextoaster/js-utils';

import { WorldEntity, WorldEntityType } from '../../model/entity';
import { Metadata } from '../../model/meta/Metadata';
import { State } from '../../model/State';
import { matchEntity, matchMetadata } from '../entity';
import { Immutable, Replace } from '../types';

export interface SearchParams {
  meta: Partial<Metadata>;
  room: Partial<Metadata>;
  type: WorldEntityType;
}

/**
 * Search state for any matching entities, including actors and their inventories.
 */
export function searchState(state: State, search: Partial<SearchParams>): Array<WorldEntity>;
export function searchState(state: Immutable<State>, search: Partial<SearchParams>): Array<Immutable<WorldEntity>>;
export function searchState(state: Immutable<State>, search: Partial<SearchParams>): Array<Immutable<WorldEntity>> {
  const results: Array<Immutable<WorldEntity>> = [];

  for (const room of state.rooms) {
    if (doesExist(search.room) && matchMetadata(room, search.room) === false) {
      continue;
    }

    if (matchEntity(room, search)) {
      results.push(room);
    }

    for (const actor of room.actors) {
      if (matchEntity(actor, search)) {
        results.push(actor);
      }

      for (const item of actor.items) {
        if (matchEntity(item, search)) {
          results.push(item);
        }
      }
    }

    for (const item of room.items) {
      if (matchEntity(item, search)) {
        results.push(item);
      }
    }
  }

  return results;
}

/**
 * Search params where the `meta` filter has been replaced with a string.
 */
type StringSearch = Replace<Partial<SearchParams>, 'meta', string>;

/**
 * Search state for any matching entities, first by ID prefix, then by name contains.
 */
export function searchStateString(state: State, search: StringSearch): Array<WorldEntity>;
export function searchStateString(state: Immutable<State>, search: StringSearch): Array<Immutable<WorldEntity>>;
export function searchStateString(state: Immutable<State>, search: StringSearch): Array<Immutable<WorldEntity>> {
  return [
    ...searchState(state, {
      ...search,
      meta: {
        id: search.meta,
      },
    }),
    ...searchState(state, {
      ...search,
      meta: {
        name: search.meta,
      },
    }),
  ];
}
