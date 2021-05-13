import { DEFAULT_SCHEMA, dump, load, Schema } from 'js-yaml';
import { DataFile, Parser } from ".";
import { mapType } from './yaml/MapType';

export class YamlParser implements Parser {
  protected schema: Schema;

  constructor() {
    this.schema = DEFAULT_SCHEMA.extend([
      mapType,
    ]);
  }

  load(data: string): DataFile {
    const parsed = load(data, {
      schema: this.schema,
    });
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('invalid data file');
    }
    return parsed as DataFile;
  }
  
  save(data: DataFile): string {
    return dump(data, {
      schema: this.schema,
    });
  }
}