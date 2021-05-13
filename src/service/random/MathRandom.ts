import { RandomGenerator } from '.';
import { BYTE_RANGE } from '../../util/constants';

export class MathRandomGenerator implements RandomGenerator {
  protected lastId: number;

  constructor() {
    this.lastId = 0;
  }

  public nextFloat() {
    return Math.random();
  }

  public nextId() {
    this.lastId += 1;
    return this.lastId;
  }

  public nextInt(max = BYTE_RANGE) {
    return Math.floor(Math.random() * max);
  }

  public reseed(initial: string) {
    // noop
  }
}
