import { doesExist, mustCoalesce, Optional } from '@apextoaster/js-utils';
import { EntityForType, WorldEntityType } from '../model/entity';

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

export function matchEntity<TType extends WorldEntityType>(entity: Immutable<Entity>, search: SearchFilter<TType>): entity is EntityForType<TType> {
  const matchers = mustCoalesce(search.matchers, createStrictMatcher<TType>());

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

export function createFuzzyMatcher<TType extends WorldEntityType>(): StateMatchers<TType> {
  return {
    entity: matchEntity,
    metadata: matchMetadataFuzzy,
  };
}

export function createStrictMatcher<TType extends WorldEntityType>(): StateMatchers<TType> {
  return {
    entity: matchEntity,
    metadata: matchMetadata,
  };
}
