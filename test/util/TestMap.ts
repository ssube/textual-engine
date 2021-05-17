import { expect } from 'chai';

import { decrementKey, getKey, incrementKey } from '../../src/util/map';

describe('map utils', () => {
  describe('decrement key helper', () => {
    it('should decrement existing keys', async () => {
      const data = new Map([['a', 1]]);
      expect(decrementKey(data, 'a')).to.equal(0);
    });

    xit('should return the default value on missing keys');
  });

  describe('increment key helper', () => {
    it('should increment existing keys', async () => {
      const data = new Map([['a', 1]]);
      expect(incrementKey(data, 'a')).to.equal(2);
    });

    xit('should return the default value on missing keys');
  });

  describe('get key helper', async () => {
    it('should get existing keys', async () => {
      const data = new Map([['a', 1]]);
      expect(getKey(data, 'a', 0)).to.equal(1);
    });

    it('should return the default value on missing keys', async () => {
      const data = new Map([['a', 1]]);
      expect(getKey(data, 'b', 0)).to.equal(0);
    });
  });
});
