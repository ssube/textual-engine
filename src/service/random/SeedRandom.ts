import { alea } from 'seedrandom';

import { RandomGenerator } from '.';
import { BYTE_RANGE } from '../../util/constants';

export class SeedRandomGenerator implements RandomGenerator {
  protected lastId: number;
  protected source: ReturnType<typeof alea>; // TODO: this should be importable, but... that is an error, this works

  constructor() {
    this.lastId = 0;
    this.source = alea();
  }

  public nextFloat() {
    return this.source.double();
  }

  public nextId() {
    this.lastId += 1;
    return this.lastId;
  }

  public nextInt(max = BYTE_RANGE) {
    return Math.abs(this.source.int32()) % max;
  }

  public reseed(initial: string) {
    this.source = alea(initial);
  }
}
