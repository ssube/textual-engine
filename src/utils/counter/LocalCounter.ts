import { Counter } from ".";

const INITIAL_VALUE = 0;

export class LocalCounter implements Counter {
  protected groups: Map<string, number>;

  constructor() {
    this.groups = new Map();
  }

  next(group: string) {
    const last = this.groups.get(group);
    if (last === null || last === undefined) {
      this.groups.set(group, INITIAL_VALUE);
      return INITIAL_VALUE;
    } else {
      this.groups.set(group, last + 1);
      return last + 1;
    }
  }
}