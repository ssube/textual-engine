import { RandomGenerator } from '.';
import { BYTE_RANGE } from '../../util/constants';

export class MathRandomGenerator implements RandomGenerator {
  public nextFloat(): number {
    return Math.random();
  }

  public nextInt(max = BYTE_RANGE, min = 0): number  {
    const range = max - min;
    return Math.floor(Math.random() * range) + min;
  }

  public reseed(initial: string): void {
    // noop
  }
}
