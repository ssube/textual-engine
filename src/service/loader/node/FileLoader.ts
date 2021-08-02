import { promises } from 'fs';

import { InjectedOptions } from '../../../module/index.js';
import { splitPath } from '../../../util/string.js';
import { BaseLoader } from '../BaseLoader.js';
import { LoaderService } from '../index.js';

export class NodeFileLoader extends BaseLoader implements LoaderService {
  protected fs: typeof promises;

  constructor(options: InjectedOptions, /* istanbul ignore next */ fs = promises) {
    super(options, ['file']);

    this.fs = fs;
  }

  public async load(fullPath: string): Promise<Buffer> {
    const { path } = splitPath(fullPath);
    // add this method frame to the stack
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const data = await promises.readFile(path);
    return data;
  }

  public async loadStr(fullPath: string): Promise<string> {
    const { path } = splitPath(fullPath);
    // add this method frame to the stack
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const data = await promises.readFile(path, {
      encoding: 'utf-8',
    });
    return data;
  }

  public async save(fullPath: string, data: Buffer): Promise<void> {
    const { path } = splitPath(fullPath);
    await promises.writeFile(path, data);
  }

  public async saveStr(fullPath: string, data: string): Promise<void> {
    const { path } = splitPath(fullPath);
    await promises.writeFile(path, data);
  }
}
