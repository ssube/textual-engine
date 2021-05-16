import { doesExist } from '@apextoaster/js-utils';

import { WorldEntity, WorldEntityType } from '../../model/entity';
import { Entity } from '../../model/entity/Base';
import { Metadata } from '../../model/meta/Metadata';
import { State } from '../../model/State';
import { Immutable } from '../types';

export interface SearchParams {
  meta: Partial<Metadata>;
  room: Partial<Metadata>
  type: WorldEntityType;
}

export function searchState(state: State, search: Partial<SearchParams>): Array<WorldEntity>;
export function searchState(state: Immutable<State>, search: Partial<SearchParams>): Array<Immutable<WorldEntity>>;
export function searchState(state: Immutable<State>, search: Partial<SearchParams>): Array<Immutable<WorldEntity>> {
  const results: Array<Immutable<WorldEntity>> = [];

  for (const room of state.rooms) {
    if (doesExist(search.room)) {
      if (matchMetadata(room, search.room) === false) {
        continue;
      }
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

type StringSearch = Omit<Partial<SearchParams>, 'meta'> & {
  meta: string;
};

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

export function matchEntity(entity: Immutable<Entity>, search: Partial<SearchParams>): boolean {
  let matched = true;

  if (doesExist(search.type)) {
    matched = matched && entity.type === search.type;
  }

  if (doesExist(search.meta)) {
    matched = matched && matchMetadata(entity, search.meta);
  }

  return matched;
}

export function matchMetadata(entity: Immutable<Entity>, filter: Partial<Metadata>): boolean {
  let matched = true;

  if (doesExist(filter.id)) {
    matched = matched && entity.meta.id.toLocaleLowerCase().startsWith(filter.id);
  }

  if (doesExist(filter.name)) {
    matched = matched && entity.meta.name.toLocaleLowerCase().includes(filter.name);
  }

  return matched;
}