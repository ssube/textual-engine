import { doesExist, mustCoalesce, Optional } from '@apextoaster/js-utils';

import { Entity } from '../model/entity/Base';
import { Metadata } from '../model/Metadata';
import { SearchFilter, StateMatchers } from './state/search';
import { matchIdSegments } from './string';
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

export function matchEntity(entity: Immutable<Entity>, search: SearchFilter): boolean {
  const matchers = mustCoalesce(search.matchers, DEFAULT_MATCHERS);

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

export const DEFAULT_MATCHERS: StateMatchers = {
  entity: matchEntity,
  metadata: matchMetadata,
};

export const FUZZY_MATCHERS: StateMatchers = {
  entity: matchEntity,
  metadata: matchMetadataFuzzy,
};
