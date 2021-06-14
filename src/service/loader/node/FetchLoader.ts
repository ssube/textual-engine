import { NotImplementedError } from '@apextoaster/js-utils';
import fetch from 'node-fetch';

import { LoaderService } from '..';
import { InjectedOptions } from '../../../module';
import { BaseLoader } from '../BaseLoader';

export class NodeFetchLoader extends BaseLoader implements LoaderService {
  protected fetch: typeof fetch;

  constructor(options: InjectedOptions, f = fetch) {
    super(options, ['http', 'https']);

    this.fetch = f;
  }

  public async load(path: string): Promise<Buffer> {
    const text = await this.loadStr(path);
    return Buffer.from(text);
  }

  public async save(_path: string, _data: Buffer): Promise<void> {
    throw new NotImplementedError();
  }

  public async loadStr(path: string): Promise<string> {
    const res = await this.fetch(path);
    // add this method frame to the stack
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const data = await res.text();
    return data;
  }

  public async saveStr(_path: string, _data: string): Promise<void> {
    throw new NotImplementedError();
  }
}
