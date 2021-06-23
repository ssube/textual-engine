import { AnySchemaObject, FuncKeywordDefinition, SchemaObjCxt, ValidateFunction } from 'ajv';

export interface MapKeyword {
  keys: any;
  values: any;
}

export const KEYWORD_MAP: FuncKeywordDefinition = {
  keyword: 'map',
  // type: 'object',
  schemaType: 'object',
  compile: (schema: MapKeyword, _parent: AnySchemaObject, it: SchemaObjCxt) => {
    const keySchema = it.self.compile(schema.keys);
    const valueSchema = it.self.compile(schema.values);

    return (data: unknown) => (data instanceof Map && checkMap(data, keySchema, valueSchema));
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
  valueSchema: ValidateFunction<TValue>
): data is Map<TKey, TValue> {
  for (const [key, value] of data) {
    return keySchema(key) && valueSchema(value);
  }
  return true;
}
