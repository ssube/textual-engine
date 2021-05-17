import Ajv from 'ajv';
import { expect } from 'chai';

import { STATE_SCHEMA } from '../../src/model/State';

describe('world state model', () => {
  it('should validate according to its schema', async () => {
    const schema = new Ajv().compile(STATE_SCHEMA);

    expect(schema({})).to.equal(false);
  });
});
