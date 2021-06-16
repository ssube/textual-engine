import { ValidateFunction } from 'ajv';
import { DEFAULT_SCHEMA, dump, load, Schema } from 'js-yaml';

import { Parser } from '.';
import { DataLoadError } from '../../error/DataLoadError';
import { DATA_SCHEMA, DataFile } from '../../model/file/Data';
import { makeSchema } from '../../util/schema';
import { mapType } from './yaml/MapType';

/**
 * Parser for JSON and YAML text, using js-yaml.
 */
export class YamlParser implements Parser {
  protected schema: Schema;
  protected validate: ValidateFunction<DataFile>;

  constructor() {
    this.schema = DEFAULT_SCHEMA.extend([
      mapType,
    ]);
    this.validate = makeSchema(DATA_SCHEMA);
  }

  public load(data: string): DataFile {
    const parsed = load(data, {
      schema: this.schema,
    });

    if (this.validate(parsed)) {
      return parsed;
    } else {
      console.error(this.validate.errors);
      throw new DataLoadError('invalid data file');
    }
  }

  public save(data: DataFile): string {
    return dump(data, {
      schema: this.schema,
    });
  }
}
