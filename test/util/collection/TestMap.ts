import { expect } from 'chai';

import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { randomItem } from '../../../src/util/collection/array';

describe('array utils', () => {
  describe('random item helper', () => {
    it('should get a random item from the input', async () => {
      const data = ['a', 'b'];
      const random = new MathRandomGenerator();
      expect(randomItem(data, random)).to.be.oneOf(data);
    });
  });
});
