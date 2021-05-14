export interface RandomGenerator {
  nextFloat(): number;
  nextId(): number;
  nextInt(max: number, min?: number): number;
  reseed(seed: string): void;
}