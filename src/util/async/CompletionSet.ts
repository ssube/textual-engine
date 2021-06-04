/**
 * Small wrapper for set to indicate emptiness when removing items.
 */
export class CompletionSet<TValue> {
  protected data: Set<TValue>;

  constructor(data?: Iterable<TValue>) {
    this.data = new Set(data);
  }

  public add(value: TValue): this {
    this.data.add(value);
    return this;
  }

  public clear(): void {
    this.data.clear();
  }

  public complete(value: TValue): boolean {
    this.data.delete(value);
    return this.data.size === 0;
  }

  public remaining(): Array<TValue> {
    return Array.from(this.data);
  }

  public get size(): number {
    return this.data.size;
  }
}
