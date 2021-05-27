export interface RandomGenerator {
  nextFloat(): number;
  nextInt(max: number, min?: number): number;
  reseed(seed: string): void;
}
