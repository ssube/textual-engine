import { Service } from '..';
import { ConfigFile } from '../../model/file/Config';
import { State } from '../../model/State';
import { World } from '../../model/World';

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
}

export interface LoaderPathEvent {
  path: string;
}

export interface LoaderConfigEvent {
  config: ConfigFile;
}

export interface LoaderStateEvent {
  state: State;
}

export interface LoaderWorldEvent {
  world: World;
}
