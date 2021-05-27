import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { BaseOptions } from 'noicejs';

import { Loader } from '..';

export class BrowserPageLoader implements Loader {
  protected dom: Document;

  constructor(options: BaseOptions, dom = document) {
    this.dom = dom;
  }

  public async dump(path: string, data: Buffer): Promise<void> {
    // eslint-disable-next-line no-console
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
    // load from page or local storage
    const elem = mustExist(this.dom.getElementById(path));
    const text = mustExist(elem.textContent);

    return text;
  }

  public async saveStr(path: string, data: string): Promise<void> {
    throw new NotImplementedError();
  }
}
