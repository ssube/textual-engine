import { alea } from 'seedrandom';

import { RandomService } from './index.js';
import { BYTE_RANGE } from '../../util/constants.js';

export class AleaRandomService implements RandomService {
  protected source: ReturnType<typeof alea>; // this should be imported above, but... that is an error, this works

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
