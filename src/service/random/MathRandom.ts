import { RandomGenerator } from '.';
import { BYTE_RANGE } from '../../util/constants';

export class MathRandomGenerator implements RandomGenerator {
  protected lastId: number;

  constructor() {
    this.lastId = 0;
  }

  public nextFloat(): number {
    return Math.random();
  }

  public nextId(): number  {
    this.lastId += 1;
    return this.lastId;
  }

  public nextInt(max = BYTE_RANGE, min = 0): number  {
    const range = max - min;
    return Math.floor(Math.random() * range) + min;
  }

  public reseed(initial: string): void {
    // noop
  }
}
