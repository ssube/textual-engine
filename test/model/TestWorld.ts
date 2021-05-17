import Ajv from 'ajv';
import { expect } from 'chai';

import { WORLD_SCHEMA } from '../../src/model/World';

describe('world model', () => {
  it('should validate according to its schema', async () => {
    const schema = new Ajv().compile(WORLD_SCHEMA);

    expect(schema({})).to.equal(false);
  });
});
