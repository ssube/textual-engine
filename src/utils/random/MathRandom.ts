import { Random } from '.';

export class MathRandom implements Random {
  nextInt(max: number, min: number = 0) {
    return Math.floor(Math.random() * max) + min;
  }
}
