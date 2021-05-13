import { State } from '../../models/State';
import { World } from '../../models/World';

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
