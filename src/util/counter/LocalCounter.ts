import { isNil } from '@apextoaster/js-utils';

import { Counter } from '.';

const INITIAL_VALUE = 0;

export class LocalCounter implements Counter {
  protected groups: Map<string, number>;

  constructor() {
    this.groups = new Map();
  }

  public next(group: string): number {
    const last = this.groups.get(group);
    if (isNil(last)) {
      this.groups.set(group, INITIAL_VALUE);
      return INITIAL_VALUE;
    } else {
      this.groups.set(group, last + 1);
      return last + 1;
    }
  }
}
