import { RandomGenerator } from '../../service/random';

export function randomItem<TValue>(items: Array<TValue>, random: RandomGenerator): TValue {
  return items[random.nextInt(items.length)];
}
