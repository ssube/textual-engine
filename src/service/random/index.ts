/**
 * Random number generator.
 */
export interface RandomService {
  /**
   * Generate a float greater than 0.
   */
  nextFloat(): number;

  /**
   * Generate an integer `[min, max)`.
   */
  nextInt(max: number, min?: number): number;

  /**
   * Reseed the generator's internal state.
   *
   * Not all random sources support this.
   */
  reseed(seed: string): void;
}
