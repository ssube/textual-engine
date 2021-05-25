import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { BaseOptions } from 'noicejs';

import { Loader } from '.';

export class PageLoader implements Loader {
  constructor(options: BaseOptions) {
    /* noop */
  }

  public async dump(path: string, data: Buffer): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(path, data);
  }

  public async load(path: string): Promise<Buffer> {
    // load from page or local storage
    const elem = mustExist(document.getElementById(path));
    const text = mustExist(elem.textContent);

    return Buffer.from(text);
  }

  public async save(path: string, data: Buffer): Promise<void> {
    // save to local storage
    throw new NotImplementedError();
  }

  public async loadStr(path: string): Promise<string> {
    const elem = mustExist(document.getElementById(path));
    return mustExist(elem.textContent);
  }

  public async saveStr(path: string, data: string): Promise<void> {
    // save
    throw new NotImplementedError();
  }
}
