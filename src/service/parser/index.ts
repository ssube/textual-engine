import { State } from '../../model/State';
import { World } from '../../model/World';

export interface DataFile {
  saves: Array<{
    state: State;
  }>;
  worlds: Array<World>;
}

export interface Parser {
  load(data: string): DataFile;
  save(data: DataFile): string;
}
