import { expect } from 'chai';

import { StackMap } from '../../../src/util/collection/StackMap';

describe('stack map', () => {
  it('should push items onto the existing list for existing keys', async () => {
    const map = new StackMap();
    expect(map.push('foo', 1)).to.equal(1);
    expect(map.push('foo', 1)).to.equal(2);
  });

  xit('should push items onto a new list for missing keys');
  xit('should pop undefined from missing keys');
  xit('should pop items from existing keys');
  xit('should get an empty list for missing keys');
  xit('should return the default value on missing keys');
});
