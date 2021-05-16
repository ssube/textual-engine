import { doesExist, isNil } from '@apextoaster/js-utils';

import { BYTE_RANGE } from './constants';

export function decrementKey<T>(map: Map<T, number>, key: T, step = 1, min = 0): number {
  const last = map.get(key);
  if (isNil(last)) {
    map.set(key, min);
    return min;
  } else {
    const next = Math.max(min, last - step);
    map.set(key, next);
    return next;
  }
}

export function incrementKey<T>(map: Map<T, number>, key: T, step = 1, max = BYTE_RANGE, base = 0): number {
  const last = map.get(key);
  if (isNil(last)) {
    map.set(key, base);
    return base;
  } else {
    const next = Math.min(max, last + step);
    map.set(key, next);
    return next;
  }
}

export function getKey<T>(map: Map<T, number>, key: T, defaultValue = 0): number {
  const last = map.get(key);
  if (doesExist(last)) {
    return last;
  } else {
    return defaultValue;
  }
}
