import { DataFile } from '../../model/file/Data';

export interface Parser {
  load(data: string): DataFile;
  save(data: DataFile): string;
}
