import { expect } from 'chai';

import { MathRandomService } from '../../../src/service/random/MathRandom';
import { groupOn, randomItem, remove } from '../../../src/util/collection/array';

describe('array utils', () => {
  describe('random item helper', () => {
    it('should get a random item from the input', async () => {
      const data = ['a', 'b'];
      const random = new MathRandomService();
      expect(randomItem(data, random)).to.be.oneOf(data);
    });
  });

  describe('remove filter', () => {
    it('should remove items that do not match', async () => {
      const data = new Array(100).fill(0).map((it, idx) => idx);
      const even = remove(data, (it) => (it % 2) === 0);

      expect(even).to.have.lengthOf(50);
    });
  });

  describe('group on delimiter helper', () => {
    it('should group items and remove delimiters', async () => {
      const delimiters = new Set(['a', 'e', 'i', 'o', 'u']);
      const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

      expect(groupOn(alphabet, delimiters)).to.deep.equal([
        ['b', 'c', 'd'],
        ['f', 'g', 'h'],
        ['j', 'k', 'l'],
      ]);
    });
  });
});
