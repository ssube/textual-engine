import { ValidateFunction } from 'ajv';
import { dump, load, Schema } from 'js-yaml';

import { Parser } from './index.js';
import { DataLoadError } from '../../error/DataLoadError.js';
import { DATA_SCHEMA, DataFile } from '../../model/file/Data.js';
import { makeParserSchema } from '../../util/parser/index.js';
import { makeSchema } from '../../util/schema/index.js';

/**
 * Parser for JSON and YAML text, using js-yaml.
 */
export class YamlParser implements Parser {
  protected schema: Schema;
  protected validate: ValidateFunction<DataFile>;

  constructor() {
    this.schema = makeParserSchema();
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
