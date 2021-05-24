import { doesExist } from '@apextoaster/js-utils';

import { WorldEntity, WorldEntityFromType, WorldEntityType } from '../../model/entity';
import { Actor, ACTOR_TYPE } from '../../model/entity/Actor';
import { Entity } from '../../model/entity/Base';
import { Room, ROOM_TYPE } from '../../model/entity/Room';
import { Metadata } from '../../model/meta/Metadata';
import { State } from '../../model/State';
import { DEFAULT_MATCHERS, matchEntity, matchMetadata } from '../entity';
import { Immutable } from '../types';

export interface SearchMatchers<TEntity extends WorldEntity> {
  entity: (entity: Immutable<Entity>, search: Partial<SearchParams<TEntity['type']>>, matchers?: SearchMatchers<TEntity>) => entity is Immutable<TEntity>;
  metadata: (entity: Immutable<Entity>, search: Partial<Metadata>) => boolean;
}

export interface SearchParams<TEntity extends WorldEntityType> {
  actor?: Partial<Metadata>;
  meta?: Partial<Metadata>;
  room?: Partial<Metadata>;
  type: TEntity;
}

/**
 * Search state for any matching entities, including actors and their inventories.
 */
export function searchState<
  TType extends WorldEntityType,
  TEntity extends WorldEntityFromType<TType> = WorldEntityFromType<TType>
>(
  state: State,
  search: SearchParams<TType>,
  matchers?: SearchMatchers<TEntity>
): Array<TEntity>;
export function searchState<
  TType extends WorldEntityType,
  TEntity extends WorldEntityFromType<TType> = WorldEntityFromType<TType>
>(
  state: Immutable<State>,
  search: SearchParams<TType>,
  matchers?: SearchMatchers<TEntity>
): Array<Immutable<TEntity>>;
export function searchState<
  TType extends WorldEntityType,
  TEntity extends WorldEntityFromType<TType> = WorldEntityFromType<TType>
>(
  state: Immutable<State>,
  search: SearchParams<TType>,
  matchers?: SearchMatchers<TEntity> = {
    entity: matchEntity,
    metadata: matchMetadata,
  } 
): Array<Immutable<TEntity>> {
  const results: Array<Immutable<TEntity>> = [];

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
export function findRoom(state: State, search: Partial<SearchParams<typeof ROOM_TYPE>>, matchers = DEFAULT_MATCHERS): Array<Room> {
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
export function findContainer(state: State, search: Partial<SearchParams<typeof ROOM_TYPE | typeof ACTOR_TYPE>>, matchers = DEFAULT_MATCHERS): Array<Actor | Room> {
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
