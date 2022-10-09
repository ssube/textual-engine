import { RandomService } from './index.js';
import { BYTE_RANGE } from '../../util/constants.js';

export class MathRandomService implements RandomService {
  public nextFloat(): number {
    return Math.random();
  }

  public nextInt(max = BYTE_RANGE, min = 0): number  {
    const range = max - min;
    return Math.floor(Math.random() * range) + min;
  }

  /* istanbul ignore next */
  public reseed(_initial: string): void {
    // noop
  }
}
