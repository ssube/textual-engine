import { EventEmitter } from 'events';

export class WatchableMap extends EventEmitter {
  protected data: Map<string, string>;

  constructor() {
    super();
    this.data = new Map();
  }

  set(key: string, value: string) {
    this.data.set(key, value);
    this.emit(key, value);
  }
}