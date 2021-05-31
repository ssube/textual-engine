import { NotImplementedError } from '@apextoaster/js-utils';
import { promises } from 'fs';
import fetch from 'node-fetch';

import { LoaderService } from '..';
import { BaseLoader, BaseLoaderOptions } from '../BaseLoader';

export class NodeFetchLoader extends BaseLoader implements LoaderService {
  protected fetch: typeof fetch;

  constructor(options: BaseLoaderOptions, f = fetch) {
    super(options, ['http', 'https']);

    this.fetch = f;
  }

  public async dump(path: string, data: Buffer): Promise<void> {
    await promises.writeFile(path, data);
  }

  public async load(path: string): Promise<Buffer> {
    const text = await this.loadStr(path);
    return Buffer.from(text);
  }

  public async save(path: string, data: Buffer): Promise<void> {
    throw new NotImplementedError();
  }

  public async loadStr(path: string): Promise<string> {
    const res = await this.fetch(path);
    // add this method frame to the stack
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const data = await res.text();
    return data;
  }

  public async saveStr(path: string, data: string): Promise<void> {
    throw new NotImplementedError();
  }
}
