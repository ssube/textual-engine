import Ajv, { ValidateFunction } from 'ajv';
import { DEFAULT_SCHEMA, dump, load, Schema } from 'js-yaml';

import { DATA_SCHEMA, DataFile, Parser } from '.';
import { mapType } from './yaml/MapType';

export class YamlParser implements Parser {
  protected schema: Schema;
  protected validate: ValidateFunction<DataFile>;

  constructor() {
    this.schema = DEFAULT_SCHEMA.extend([
      mapType,
    ]);
    this.validate = new Ajv({
      useDefaults: true,
    }).compile(DATA_SCHEMA);
  }

  public load(data: string): DataFile {
    const parsed = load(data, {
      schema: this.schema,
    });

    if (this.validate(parsed)) {
      return parsed;
    } else {
      console.error(this.validate.errors);
      throw new Error('invalid data file');
    }

  }

  public save(data: DataFile): string {
    return dump(data, {
      schema: this.schema,
    });
  }
}
