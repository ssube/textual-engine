import { isNil } from '@apextoaster/js-utils';

export class Singleton<TValue> {
  protected value?: TValue;

  constructor(value?: TValue) {
    this.value = value;
  }

  public async get(ctor: () => Promise<TValue>): Promise<TValue> {
    if (isNil(this.value)) {
      this.value = await ctor();
    }
    return this.value;
  }
}