import { RandomGenerator } from '../../service/random';

export function randomItem<TValue>(items: Array<TValue>, random: RandomGenerator): TValue {
  return items[random.nextInt(items.length)];
}

export function remove<TValue>(items: Array<TValue>, pred: (value: TValue, index: number, list: Array<TValue>) => boolean): Array<TValue> {
  return items.filter((value, index, list) => pred(value, index, list) === false);
}
