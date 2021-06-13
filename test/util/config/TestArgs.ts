import { expect } from 'chai';

import { parseArgs } from '../../../src/util/config/args';

describe('config args', () => {
  it('should provide some default modules', async () => {
    const args = parseArgs([]);
    expect(args.module).to.have.lengthOf(2);
  });
});
