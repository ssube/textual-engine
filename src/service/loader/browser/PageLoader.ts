import { mustExist, NotImplementedError } from '@apextoaster/js-utils';

import { LoaderService } from '..';
import { splitPath } from '../../../util/string';
import { BaseLoader, BaseLoaderOptions } from '../BaseLoader';

export class BrowserPageLoader extends BaseLoader implements LoaderService {
  protected dom: Document;

  constructor(options: BaseLoaderOptions, dom = document) {
    super(options, ['page']);
    this.dom = dom;
  }

  public async load(path: string): Promise<Buffer> {
    const text = await this.loadStr(path);
    return Buffer.from(text);
  }

  public async save(path: string, data: Buffer): Promise<void> {
    throw new NotImplementedError();
  }

  public async loadStr(fullPath: string): Promise<string> {
    const { path } = splitPath(fullPath);
    const elem = mustExist(this.dom.getElementById(path));
    return mustExist(elem.textContent);
  }

  public async saveStr(path: string, data: string): Promise<void> {
    throw new NotImplementedError();
  }
}
