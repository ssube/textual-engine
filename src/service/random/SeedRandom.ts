import { alea } from 'seedrandom';

import { RandomGenerator } from '.';
import { BYTE_RANGE } from '../../util/constants';

export class SeedRandomGenerator implements RandomGenerator {
  protected lastId: number;
  protected source: ReturnType<typeof alea>; // this should be imported above, but... that is an error, this works

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

  public nextInt(max = BYTE_RANGE, min = 0) {
    const range = max - min;
    return (Math.abs(this.source.int32()) % range) + min;
  }

  public reseed(initial: string) {
    this.source = alea(initial);
  }
}
