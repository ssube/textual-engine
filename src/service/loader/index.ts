import { Service } from '..';
import { DataFile } from '../../model/file/Data';

export interface LoaderService extends Service {
  /**
   * Write a debug payload to a local path.
   *
   * This always writes to a local resource, even for network-based loaders.
   */
  dump(path: string, data: Buffer): Promise<void>;

  /**
   * Load a resource by path.
   */
  load(path: string): Promise<Buffer>;

  /**
   * Save a resource by path.
   */
  save(path: string, data: Buffer): Promise<void>;

  /**
   * Load a resource and parse the data as a UTF-8 string.
   */
  loadStr(path: string): Promise<string>;

  /**
   * Save a resource from a UTF-8 string.
   */
  saveStr(path: string, data: string): Promise<void>;

  loadData(path: string): Promise<DataFile>;

  saveData(path: string, data: DataFile): Promise<void>;
}
