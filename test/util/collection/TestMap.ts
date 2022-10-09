import { expect } from 'chai';

import { decrementKey, getKey, incrementKey } from '../../../src/util/collection/map.js';

describe('map utils', () => {
  describe('decrement key helper', () => {
    it('should decrement existing keys', async () => {
      const data = new Map([['a', 1]]);
      const [_result, value] = decrementKey(data, 'a');
      expect(value).to.equal(0);
    });

    it('should return the default value on missing keys', async () => {
      const data = new Map([['b', 2]]);
      const [_result, value] = decrementKey(data, 'a', 1, 10);
      expect(value).to.equal(10);
    });
  });

  describe('increment key helper', () => {
    it('should increment existing keys', async () => {
      const data = new Map([['a', 1]]);
      const [_result, value] = incrementKey(data, 'a');
      expect(value).to.equal(2);
    });

    it('should return the default value on missing keys', async () => {
      const data = new Map([['b', 2]]);
      const [_result, value] = incrementKey(data, 'a', 10);
      expect(value).to.equal(10);
    });
  });

  describe('get key helper', async () => {
    it('should get existing keys', async () => {
      const data = new Map([['a', 1]]);
      expect(getKey(data, 'a')).to.equal(1);
    });

    it('should return the default value on missing keys', async () => {
      const data = new Map([['a', 1]]);
      expect(getKey(data, 'b', 10)).to.equal(10);
    });
  });
});
