import { doesExist } from '@apextoaster/js-utils';
import { ConfigFile } from '../../model/file/Config';
import { DataFile } from '../../model/file/Data';
import { WorldState } from '../../model/world/State';
import { WorldTemplate } from '../../model/world/Template';

export interface LoaderReadEvent {
  path: string;
}

export interface LoaderSaveEvent {
  // TODO: two fields rather than union
  data: DataFile | string;
  path: string;
}

export interface LoaderConfigEvent {
  config: ConfigFile;
}

export interface LoaderStateEvent {
  state: WorldState;
}

export interface LoaderWorldEvent {
  world: WorldTemplate;
}

export function hasState(it: LoaderReadEvent | LoaderConfigEvent | LoaderStateEvent | LoaderWorldEvent): it is LoaderStateEvent {
  return typeof it === 'object' && doesExist(it) && doesExist((it as LoaderStateEvent).state);
}
