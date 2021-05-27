import { promises } from 'fs';
import { BaseOptions } from 'noicejs';

import { Loader } from '..';

export class NodeFileLoader implements Loader {
  protected fs: typeof promises;

  constructor(options: BaseOptions, fs = promises) {
    this.fs = fs;
  }

  public async dump(path: string, data: Buffer): Promise<void> {
    await promises.writeFile(path, data);
  }

  public async load(path: string): Promise<Buffer> {
    // add this method frame to the stack
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const data = await promises.readFile(path);
    return data;
  }

  public async save(path: string, data: Buffer): Promise<void> {
    await promises.writeFile(path, data);
  }

  public async loadStr(path: string): Promise<string> {
    // add this method frame to the stack
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const data = await promises.readFile(path, {
      encoding: 'utf-8',
    });
    return data;
  }

  public async saveStr(path: string, data: string): Promise<void> {
    await promises.writeFile(path, data);
  }
}
