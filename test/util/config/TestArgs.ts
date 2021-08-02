import { expect } from 'chai';

import { parseArgs } from '../../../src/util/config/args.js';

describe('config args', () => {
  it('should provide some default modules', async () => {
    const args = parseArgs([]);
    expect(args.module).to.have.lengthOf(2);
  });
});
