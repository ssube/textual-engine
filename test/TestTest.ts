import { expect } from 'chai';

import { incrementKey } from '../src/util/map';

describe('the test foo', () => {
  it('should do bars', () => {
    const data = new Map([['a', 1]]);
    expect(incrementKey(data, 'a')).to.equal(2);
  });
});
