import { isNone } from '@apextoaster/js-utils';

export type SingletonConstructor<TValue> = () => Promise<TValue>;

export class Singleton<TValue> {
  protected ctor: SingletonConstructor<TValue>;
  protected value?: TValue;

  constructor(ctor: SingletonConstructor<TValue>, value?: TValue) {
    this.ctor = ctor;
    this.value = value;
  }

  public async get(): Promise<TValue> {
    if (isNone(this.value)) {
      this.value = await this.ctor();
    }

    return this.value;
  }
}
