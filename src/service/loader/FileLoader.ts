import { promises } from 'fs';

import { Loader } from '.';

export class FileLoader implements Loader {
  async dump(path: string, data: Buffer): Promise<void> {
    await promises.writeFile(path, data);
  }

  async load(path: string): Promise<Buffer> {
    const data = await promises.readFile(path);
    return data;
  }

  async save(path: string, data: Buffer): Promise<void> {
    await promises.writeFile(path, data);
  }

  async loadStr(path: string): Promise<string> {
    const data = await promises.readFile(path, {
      encoding: 'utf-8',
    });
    return data;
  }

  async saveStr(path: string, data: string): Promise<void> {
    await promises.writeFile(path, data);
  }
}
