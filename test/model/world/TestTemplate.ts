import Ajv from 'ajv';
import { expect } from 'chai';

import { WORLD_TEMPLATE_SCHEMA } from '../../../src/model/world/Template';

describe('world model', () => {
  it('should validate according to its schema', async () => {
    const schema = new Ajv().compile(WORLD_TEMPLATE_SCHEMA);

    expect(schema({})).to.equal(false);
  });
});
