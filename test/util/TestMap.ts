import { expect } from 'chai';

import { incrementKey } from '../../src/util/map';

describe('map utils', () => {
  it('should increment keys', async () => {
    const data = new Map([['a', 1]]);
    expect(incrementKey(data, 'a')).to.equal(2);
  });
});
