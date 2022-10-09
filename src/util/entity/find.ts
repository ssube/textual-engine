import { doesExist, mustCoalesce, Optional } from '@apextoaster/js-utils';

import { EntityForType, WorldEntityType } from '../../model/entity/index.js';
import { Actor, ActorType, ReadonlyActor } from '../../model/entity/Actor.js';
import { Entity } from '../../model/entity/Base.js';
import { ReadonlyItem } from '../../model/entity/Item.js';
import { isRoom, ReadonlyRoom, Room, RoomType } from '../../model/entity/Room.js';
import { Metadata } from '../../model/Metadata.js';
import { WorldState } from '../../model/world/State.js';
import { hasText, matchIdSegments } from '../string.js';
import { Immutable } from '../types.js';
import { createStrictMatcher } from './match.js';

export interface StateMatchers<TEntity extends WorldEntityType> {
  entity: (entity: Immutable<Entity>, search: SearchFilter<TEntity>) => entity is EntityForType<TEntity>;
  metadata: (entity: Immutable<Entity>, search: Partial<Metadata>) => boolean;
}

export interface SearchFilter<TType extends WorldEntityType> {
  actor?: Partial<Metadata>;
  meta?: Partial<Metadata>;
  room?: Partial<Metadata>;

  type?: TType;

  matchers?: StateMatchers<TType>;
}

/**
 * Search state for any matching entities, including actors and their inventories.
 */
// eslint-disable-next-line complexity,sonarjs/cognitive-complexity
export function findMatching<TType extends WorldEntityType>(rooms: ReadonlyArray<ReadonlyRoom>, search: SearchFilter<TType>): Array<Immutable<EntityForType<TType>>> {
  const matchers = mustCoalesce(search.matchers, createStrictMatcher<TType>());
  const results: Array<EntityForType<TType>> = [];

  for (const room of rooms) {
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

    for (const portal of room.portals) {
      if (matchers.entity(portal, search)) {
        results.push(portal);
      }
    }
  }

  return results as Array<Immutable<EntityForType<TType>>>;
}

/**
 * Find the room that contains a particular entity.
 */
export function findRoom(state: WorldState, search: SearchFilter<RoomType>): Array<Room> {
  const results = findContainer(state, search);
  // this has to use the filter and guard, because adding type to the search does not work for containers
  return results.filter(isRoom);
}

/**
 * Find the room or actor that contains a particular item.
 */
// eslint-disable-next-line complexity,sonarjs/cognitive-complexity
export function findContainer<TType extends ActorType | RoomType>(state: WorldState, search: SearchFilter<TType>): Array<Actor | Room> {
  const matchers = mustCoalesce(search.matchers, createStrictMatcher<TType>());
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

    for (const portal of room.portals) {
      if (matchers.entity(portal, search)) {
        results.add(room);
      }
    }
  }

  return Array.from(results);
}

/**
 * Find the item equipped in a particular slot.
 */
export function findSlotItem(actor: ReadonlyActor, slot: string): Optional<ReadonlyItem> {
  const id = actor.slots.get(slot);
  if (doesExist(id) && hasText(id)) {
    return actor.items.find((it) => it.meta.id === id);
  } else {
    return undefined;
  }
}

export function findActorSlots(actor: ReadonlyActor, filter: string): Array<string> {
  return Array.from(actor.slots.keys()).filter((it) => matchIdSegments(it, filter));
}
