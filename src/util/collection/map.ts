import { doesExist } from '@apextoaster/js-utils';

import { BYTE_RANGE } from '../constants.js';

export function decrementKey<TKey>(map: ReadonlyMap<TKey, number>, key: TKey, step = 1, min = 0): [ReadonlyMap<TKey, number>, number] {
  const result = new Map(map);

  const last = map.get(key);
  let value;
  if (doesExist(last)) {
    value = Math.max(min, last - step);
    result.set(key, value);
  } else {
    value = min;
    result.set(key, value);
  }

  return [result, value];
}

export function incrementKey<TKey>(map: ReadonlyMap<TKey, number>, key: TKey, step = 1, max = BYTE_RANGE): [ReadonlyMap<TKey, number>, number] {
  const result = new Map(map);

  const last = map.get(key);
  let value;
  if (doesExist(last)) {
    value = Math.min(max, last + step);
    result.set(key, value);
  } else {
    value = step;
    result.set(key, value);
  }

  return [result, value];
}

export function getKey<TKey>(map: ReadonlyMap<TKey, number>, key: TKey, defaultValue = 0): number {
  const last = map.get(key);
  if (doesExist(last)) {
    return last;
  } else {
    return defaultValue;
  }
}

export function setKey<TKey, TValue>(map: ReadonlyMap<TKey, TValue>, key: TKey, value: TValue): ReadonlyMap<TKey, TValue> {
  const result = new Map(map);
  result.set(key, value);
  return result;
}
