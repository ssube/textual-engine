import { EventEmitter } from 'events';

export class WatchableMap extends EventEmitter {
  protected data: Map<string, string>;

  constructor() {
    super();
    this.data = new Map();
  }

  public set(key: string, value: string): this {
    this.data.set(key, value);
    this.emit(key, value);
    return this;
  }
}
