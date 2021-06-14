import { expect } from 'chai';

import { WORLD_TEMPLATE_SCHEMA } from '../../../src/model/world/Template';
import { makeSchema } from '../../../src/util/schema';

describe('modifier mapped model', () => {
  it('should validate metadata modifiers', async () => {
    const schema = makeSchema(WORLD_TEMPLATE_SCHEMA);

    expect(schema({})).to.equal(false);
  });
});
