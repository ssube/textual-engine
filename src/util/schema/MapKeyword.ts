import { doesExist } from '@apextoaster/js-utils';
import Ajv, { AnySchemaObject, FuncKeywordDefinition, SchemaObjCxt, ValidateFunction } from 'ajv';
import { DataValidateFunction, DataValidationCxt, ErrorObject } from 'ajv/dist/types';

export interface MapKeyword {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keys: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any;
}

export const KEYWORD_MAP: FuncKeywordDefinition = {
  keyword: 'map',
  schemaType: 'object',
  compile: (schema: MapKeyword, _parent: AnySchemaObject, it: SchemaObjCxt): DataValidateFunction => {
    const keySchema = it.self.compile(schema.keys);
    const valueSchema = it.self.compile(schema.values);

    const validate: DataValidateFunction = function(this: Ajv, data: unknown, _ctx?: DataValidationCxt) {
      if (data instanceof Map) {
        validate.errors = [];
        return checkMap(data, keySchema, valueSchema, validate.errors);
      }

      return false;
    };

    return validate;
  },
  metaSchema: {
    type: 'object',
    properties: {
      keys: {
        type: 'object',
      },
      values: {
        type: 'object',
      },
    },
  },
};

export function checkMap<TKey, TValue>(
  data: Map<unknown, unknown>,
  keySchema: ValidateFunction<TKey>,
  valueSchema: ValidateFunction<TValue>,
  outErrors: Array<Partial<ErrorObject>>
): data is Map<TKey, TValue> {
  let pass = true;

  for (const [key, value] of data) {
    if (keySchema(key) === false) {
      pass = false;
      if (doesExist(keySchema.errors)) {
        outErrors.push(...keySchema.errors);
      }
    }

    if (valueSchema(value) === false) {
      pass = false;
      if (doesExist(valueSchema.errors)) {
        outErrors.push(...valueSchema.errors);
      }
    }
  }

  return pass;
}
