import { doesExist, mustCoalesce, Optional } from '@apextoaster/js-utils';

import { EntityForType, WorldEntityType } from '../../model/entity/index.js';
import { Entity } from '../../model/entity/Base.js';
import { isPortal } from '../../model/entity/Portal.js';
import { Metadata } from '../../model/Metadata.js';
import { matchIdSegments } from '../string.js';
import { Immutable } from '../types.js';
import { SearchFilter, StateMatchers } from './find.js';

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
    matched = matched && entity.type === search.type; // lgtm [js/trivial-conditional]
  }

  if (doesExist(search.meta)) {
    matched = matched && matchers.metadata(entity, search.meta);
  }

  return matched;
}

export function matchMetadata(entity: Immutable<Entity>, filter: Partial<Metadata>): boolean {
  // if either one is specified but does not match, reject
  const matched = {
    id: true,
    name: true,
  };

  if (doesExist(filter.id)) {
    const id = entity.meta.id.toLocaleLowerCase();
    matched.id = matchIdSegments(id, filter.id);
  }

  if (doesExist(filter.name)) {
    const name = entity.meta.name.toLocaleLowerCase();
    matched.name = name.includes(filter.name);
  }

  return matched.id && matched.name;
}

export function matchMetadataFuzzy(entity: Immutable<Entity>, filter: Partial<Metadata>): boolean {
  const matched = {
    id: true,
    name: true,
  };

  const id = entity.meta.id.toLocaleLowerCase();
  if (doesExist(filter.id)) {
    matched.id = matchIdSegments(id, filter.id);
  }

  if (doesExist(filter.name)) {
    matched.name = id.includes(filter.name);

    const name = entity.meta.name.toLocaleLowerCase();
    matched.name = matched.name || name.includes(filter.name);

    // TODO: extract into helper
    if (isPortal(entity)) {
      const sourceName = [
        entity.group.source.toLocaleLowerCase(),
        name,
      ].join(' ');
      matched.name = matched.name || sourceName.includes(filter.name);
    }
  }

  return matched.id && matched.name;
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
