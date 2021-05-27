import { alea } from 'seedrandom';

import { RandomGenerator } from '.';
import { BYTE_RANGE } from '../../util/constants';

export class SeedRandomGenerator implements RandomGenerator {
  protected source: ReturnType<typeof alea>; // this should be imported above, but... that is an error, this works

  constructor() {
    this.source = alea();
  }

  public nextFloat(): number {
    return this.source.double();
  }

  public nextInt(max = BYTE_RANGE, min = 0): number {
    const range = max - min;
    return (Math.abs(this.source.int32()) % range) + min;
  }

  public reseed(initial: string): void {
    this.source = alea(initial);
  }
}
