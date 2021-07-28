import { expect } from 'chai';

import { WORLD_STATE_SCHEMA } from '../../../src/model/world/State.js';
import { makeSchema } from '../../../src/util/schema/index.js';

describe('world state model', () => {
  it('should validate according to its schema', async () => {
    const schema = makeSchema(WORLD_STATE_SCHEMA);

    expect(schema({})).to.equal(false);
  });
});
