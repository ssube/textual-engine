import { doesExist, mustExist } from '@apextoaster/js-utils';

export class StackMap<TKey, TValue> {
  protected data: Map<TKey, Array<TValue>>;

  constructor() {
    this.data = new Map();
  }

  public clear(): void {
    return this.data.clear();
  }

  public depth(key: TKey): number {
    if (this.has(key)) {
      return this.getOrThrow(key).length;
    } else {
      return 0;
    }
  }

  public get(key: TKey): Array<TValue> {
    return this.getOrCreate(key);
  }

  public has(key: TKey): boolean {
    return this.data.has(key);
  }

  public push(key: TKey, item: TValue): number {
    const stack = this.getOrCreate(key);
    return stack.push(item);
  }

  public pop(key: TKey): TValue | undefined {
    const stack = this.getOrCreate(key);
    return stack.pop();
  }

  public get size(): number {
    return this.data.size;
  }

  protected getOrCreate(key: TKey): Array<TValue> {
    const existing = this.data.get(key);
    if (doesExist(existing)) {
      return existing;
    }

    const stack: Array<TValue> = [];
    this.data.set(key, stack);

    return stack;
  }

  protected getOrThrow(key: TKey): Array<TValue> {
    return mustExist(this.data.get(key));
  }
}
