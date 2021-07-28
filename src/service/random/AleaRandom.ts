import seedrandom from 'seedrandom';

import { BYTE_RANGE } from '../../util/constants.js';
import { RandomGenerator, RandomService } from './index.js';

const { alea } = seedrandom;

export class AleaRandomService implements RandomService {
  protected source: RandomGenerator;

  constructor() {
    this.source = alea();
  }

  public nextFloat(): number {
    return this.source.double();
  }

  public nextInt(max = BYTE_RANGE, min = 0): number {
    const range = Math.floor(max) - Math.floor(min);

    if (range < 1) {
      return max;
    }

    return (Math.abs(this.source.int32()) % range) + min;
  }

  public reseed(initial: string): void {
    this.source = alea(initial);
  }
}
