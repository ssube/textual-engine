import { expect } from 'chai';

import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { randomItem, remove } from '../../../src/util/collection/array';

describe('array utils', () => {
  describe('random item helper', () => {
    it('should get a random item from the input', async () => {
      const data = ['a', 'b'];
      const random = new MathRandomGenerator();
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
});
