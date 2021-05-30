import { ConfigFile } from '../../model/file/Config';
import { DataFile } from '../../model/file/Data';
import { State } from '../../model/State';
import { World } from '../../model/World';

export interface LoaderReadEvent {
  path: string;
}

export interface LoaderSaveEvent {
  // TODO: two fields rather than union?
  data: DataFile | string;
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
