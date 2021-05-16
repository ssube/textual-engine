import { doesExist } from '@apextoaster/js-utils';

import { WorldEntity, WorldEntityType } from '../../model/entity';
import { Entity } from '../../model/entity/Base';
import { Metadata } from '../../model/meta/Metadata';
import { State } from '../../model/State';

export interface SearchParams {
  meta: Partial<Metadata>;
  // TODO: match room: Partial<Metadata>
  type: WorldEntityType;
}

export function searchState(state: State, search: Partial<SearchParams>): Array<WorldEntity> {
  const results: Array<WorldEntity> = [];

  for (const room of state.rooms) {
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

export function matchEntity(entity: Entity, search: Partial<SearchParams>): boolean {
  let matched = true;

  if (doesExist(search.type)) {
    matched = matched && entity.type === search.type;
  }

  if (doesExist(search.meta)) {
    matched = matched && matchMetadata(entity, search.meta);
  }

  return matched;
}

export function matchMetadata(entity: Entity, filter: Partial<Metadata>): boolean {
  let matched = true;

  if (doesExist(filter.id)) {
    matched = matched && entity.meta.id.toLocaleLowerCase().startsWith(filter.id);
  }

  if (doesExist(filter.name)) {
    matched = matched && entity.meta.name.toLocaleLowerCase().includes(filter.name);
  }

  return matched;
}