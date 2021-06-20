import { mustExist } from '@apextoaster/js-utils';
import { RandomGenerator } from '../../service/random';

export function randomItem<TValue>(items: Array<TValue>, random: RandomGenerator): TValue {
  return items[random.nextInt(items.length)];
}

export function remove<TValue>(items: Array<TValue>, pred: (value: TValue, index: number, list: Array<TValue>) => boolean): Array<TValue> {
  return items.filter((value, index, list) => pred(value, index, list) === false);
}

export function groupOn<TValue>(items: Array<TValue>, delimiters: Set<TValue>): Array<Array<TValue>> {
  const groups = [];
  const buffer = [];

  for (const item of items) {
    if (delimiters.has(item)) {
      if (buffer.length > 0) {
        groups.push(Array.from(buffer)); // copy
        buffer.length = 0;
      }
    } else {
      buffer.push(item);
    }
  }

  if (buffer.length > 0) {
    groups.push(buffer);
  }

  return groups;
}

export function head<TValue>(list: Array<TValue>): TValue {
  return mustExist(list[0]);
}
