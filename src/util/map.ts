import { doesExist } from '@apextoaster/js-utils';

import { BYTE_RANGE } from './constants';

export function decrementKey<TKey>(map: Map<TKey, number>, key: TKey, step = 1, min = 0): number {
  const last = map.get(key);
  if (doesExist(last)) {
    const next = Math.max(min, last - step);
    map.set(key, next);
    return next;
  } else {
    map.set(key, min);
    return min;
  }
}

export function incrementKey<TKey>(map: Map<TKey, number>, key: TKey, step = 1, max = BYTE_RANGE): number {
  const last = map.get(key);
  if (doesExist(last)) {
    const next = Math.min(max, last + step);
    map.set(key, next);
    return next;
  } else {
    map.set(key, step);
    return step;
  }
}

export function getKey<TKey>(map: Map<TKey, number>, key: TKey, defaultValue = 0): number {
  const last = map.get(key);
  if (doesExist(last)) {
    return last;
  } else {
    return defaultValue;
  }
}
