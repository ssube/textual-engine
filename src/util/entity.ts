import { doesExist } from '@apextoaster/js-utils';

import { Entity } from '../model/entity/Base';
import { Metadata } from '../model/meta/Metadata';
import { SearchParams } from './state';
import { Immutable } from './types';

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
