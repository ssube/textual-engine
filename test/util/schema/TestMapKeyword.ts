import { JSONSchemaType } from 'ajv';
import { expect } from 'chai';

import { makeSchema } from '../../../src/lib';

interface TestData {
  data: Map<number, number>;
}

const TEST_DATA_SCHEMA: JSONSchemaType<TestData> = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      map: {
        keys: {
          type: 'number',
        },
        values: {
          type: 'number',
        },
      },
      required: [],
    },
  },
  required: ['data'],
};

describe('schema map keyword', () => {
  it('should pass if all items pass', async () => {
    const data = new Map<number, number>([
      [1, 2],
      [3, 4],
    ]);

    const schema = makeSchema<TestData>(TEST_DATA_SCHEMA);

    expect(schema({ data })).to.equal(true);
  });

  it('should fail if any key fails', async () => {
    const data = new Map<unknown, number>([
      [1, 2],
      ['3', 4],
    ]);

    const schema = makeSchema<TestData>(TEST_DATA_SCHEMA);

    expect(schema({ data })).to.equal(false);
  });

  it('should fail if any value fails', async () => {
    const data = new Map<number, unknown>([
      [1, 2],
      [3, '4'],
    ]);

    const schema = makeSchema<TestData>(TEST_DATA_SCHEMA);

    expect(schema({ data })).to.equal(false);
  });

  it('should collect errors from all items', async () => {
    const data = new Map<unknown, unknown>([
      ['1', '2'],
      ['3', '4'],
    ]);

    const schema = makeSchema<TestData>(TEST_DATA_SCHEMA);
    schema({ data });

    expect(schema.errors, 'schema errors').to.have.lengthOf(4);
  });

  it('should only match maps', async () => {
    const schema = makeSchema<TestData>(TEST_DATA_SCHEMA);

    expect(schema({ data: {} })).to.equal(false);
  });
});

