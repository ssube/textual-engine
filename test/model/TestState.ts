import Ajv from 'ajv';
import { expect } from 'chai';

import { WORLD_STATE_SCHEMA } from '../../src/model/world/State';

describe('world state model', () => {
  it('should validate according to its schema', async () => {
    const schema = new Ajv().compile(WORLD_STATE_SCHEMA);

    expect(schema({})).to.equal(false);
  });
});
