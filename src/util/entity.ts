import { doesExist, Optional } from '@apextoaster/js-utils';

import { Entity } from '../model/entity/Base';
import { Metadata } from '../model/meta/Metadata';
import { SearchMatchers, SearchParams } from './state';
import { Immutable } from './types';

export function indexEntity<TEntity extends Entity>(entities: Array<Immutable<Entity>>, index: number, guard: (it: Optional<Entity>) => it is TEntity): Optional<TEntity> {
  if (entities.length <= index) {
    return undefined;
  }

  const entity = entities[index];
  if (guard(entity)) {
    return entity;
  }

  return undefined;
}

export function matchEntity(entity: Immutable<Entity>, search: Partial<SearchParams>, matchers = DEFAULT_MATCHERS): boolean {
  let matched = true;

  if (doesExist(search.type)) {
    matched = matched && entity.type === search.type;
  }

  if (doesExist(search.meta)) {
    matched = matched && matchers.metadata(entity, search.meta);
  }

  return matched;
}

export function matchMetadata(entity: Immutable<Entity>, filter: Partial<Metadata>): boolean {
  let matched = true;

  if (doesExist(filter.id)) {
    matched = matched && matchIdSegments(entity.meta.id.toLocaleLowerCase(), filter.id);
  }

  if (doesExist(filter.name)) {
    matched = matched && entity.meta.name.toLocaleLowerCase().includes(filter.name);
  }

  return matched;
}

export function matchMetadataFuzzy(entity: Immutable<Entity>, filter: Partial<Metadata>): boolean {
  let matched = true;

  const id = entity.meta.id.toLocaleLowerCase();

  if (doesExist(filter.id)) {
    matched = matched && matchIdSegments(id, filter.id);
  }

  if (doesExist(filter.name)) {
    matched = matched && (
      id.includes(filter.name) ||
      entity.meta.name.toLocaleLowerCase().includes(filter.name)
    );
  }

  return matched;
}

export function matchIdSegments(value: string, filter: string): boolean {
  const valueParts = value.split('-');
  const filterParts = filter.split('-');

  if (filterParts.length < valueParts.length) {
    return false;
  }

  return valueParts.every((it, idx) => it === filterParts[idx]);
}

export const DEFAULT_MATCHERS: SearchMatchers = {
  entity: matchEntity,
  metadata: matchMetadata,
};

export const FUZZY_MATCHERS: SearchMatchers = {
  entity: matchEntity,
  metadata: matchMetadataFuzzy,
};
