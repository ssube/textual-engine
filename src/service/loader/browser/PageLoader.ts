import { mustExist, NotImplementedError } from '@apextoaster/js-utils';

import { InjectedOptions } from '../../../module/index.js';
import { splitPath } from '../../../util/string.js';
import { BaseLoader } from '../BaseLoader.js';
import { LoaderService } from '../index.js';

export class BrowserPageLoader extends BaseLoader implements LoaderService {
  protected dom: Document;

  constructor(options: InjectedOptions, /* istanbul ignore next */ dom = document) {
    super(options, ['page']);
    this.dom = dom;
  }

  public async load(path: string): Promise<Buffer> {
    const text = await this.loadStr(path);
    return Buffer.from(text);
  }

  public async save(_path: string, _data: Buffer): Promise<void> {
    throw new NotImplementedError();
  }

  public async loadStr(fullPath: string): Promise<string> {
    const { path } = splitPath(fullPath);
    const elem = mustExist(this.dom.getElementById(path));
    return mustExist(elem.textContent);
  }

  public async saveStr(_path: string, _data: string): Promise<void> {
    throw new NotImplementedError();
  }
}
