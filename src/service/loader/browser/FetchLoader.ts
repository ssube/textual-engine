import { NotImplementedError } from '@apextoaster/js-utils';
import { BaseOptions } from 'noicejs';

import { Loader } from '..';

export class BrowserFetchLoader implements Loader {
  protected fetch: typeof fetch;

  constructor(options: BaseOptions, f = window.fetch) {
    this.fetch = fetch;
  }

  public async dump(path: string, data: Buffer): Promise<void> {
    console.log(path, data);
  }

  public async load(path: string): Promise<Buffer> {
    const text = await this.loadStr(path);
    return Buffer.from(text);
  }

  public async save(path: string, data: Buffer): Promise<void> {
    throw new NotImplementedError();
  }

  public async loadStr(path: string): Promise<string> {
    const res = await this.fetch.call(window, path);
    // add this method frame to the stack
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const data = await res.text();
    return data;
  }

  public async saveStr(path: string, data: string): Promise<void> {
    throw new NotImplementedError();
  }
}
