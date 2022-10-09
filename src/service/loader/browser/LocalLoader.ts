import { mustExist } from '@apextoaster/js-utils';

import { LoaderService } from '..';
import { InjectedOptions } from '../../../module/index.js';
import { splitPath } from '../../../util/string.js';
import { BaseLoader } from '../BaseLoader.js';

export class BrowserLocalLoader extends BaseLoader implements LoaderService {
  protected local: Storage;

  constructor(options: InjectedOptions, /* istanbul ignore next */ w = window) {
    super(options, ['local', 'session']);
    this.local = w.localStorage;
  }

  public async load(path: string): Promise<Buffer> {
    const text = await this.loadStr(path);
    return Buffer.from(text);
  }

  public async save(path: string, data: Buffer): Promise<void> {
    const text = data.toString('utf-8');
    return this.saveStr(path, text);
  }

  public async loadStr(fullPath: string): Promise<string> {
    const { path } = splitPath(fullPath);
    const data = this.local.getItem(path);
    return mustExist(data);
  }

  public async saveStr(fullPath: string, data: string): Promise<void> {
    const { path } = splitPath(fullPath);
    this.local.setItem(path, data);
  }
}
