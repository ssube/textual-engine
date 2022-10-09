import { mustExist } from '@apextoaster/js-utils';
import { RandomService } from '../../service/random/index.js';

export function randomItem<TValue>(items: ReadonlyArray<TValue>, random: RandomService): TValue {
  return items[random.nextInt(items.length)];
}

export function remove<TValue>(items: ReadonlyArray<TValue>, pred: (value: TValue, index: number, list: ReadonlyArray<TValue>) => boolean): Array<TValue> {
  return items.filter((value, index, list) => pred(value, index, list) === false);
}

export function groupOn<TValue>(items: ReadonlyArray<TValue>, delimiters: Set<TValue>): Array<Array<TValue>> {
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

export function head<TValue>(list: ReadonlyArray<TValue>): TValue {
  return mustExist(list[0]);
}
