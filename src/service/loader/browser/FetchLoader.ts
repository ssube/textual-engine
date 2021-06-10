import { NotImplementedError } from '@apextoaster/js-utils';

import { LoaderService } from '..';
import { BaseLoader, BaseLoaderOptions } from '../BaseLoader';

export class BrowserFetchLoader extends BaseLoader implements LoaderService {
  protected fetch: typeof fetch;
  protected scope: typeof window;

  constructor(options: BaseLoaderOptions, w = window) {
    super(options, ['http', 'https']);
    this.fetch = w.fetch;
    this.scope = w;
  }

  public async load(path: string): Promise<Buffer> {
    const text = await this.loadStr(path);
    return Buffer.from(text);
  }

  public async save(path: string, data: Buffer): Promise<void> {
    throw new NotImplementedError();
  }

  public async loadStr(path: string): Promise<string> {
    // fetch has to be called with this = window
    const res = await this.fetch.call(this.scope, path);
    // add this method frame to the stack
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const data = await res.text();
    return data;
  }

  public async saveStr(path: string, data: string): Promise<void> {
    throw new NotImplementedError();
  }
}
