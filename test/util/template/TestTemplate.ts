import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { findByBaseId } from '../../../src/util/template/index.js';

describe('template helpers', () => {
  describe('find template by id', () => {
    it('should throw when no item is found', async () => {
      expect(() => findByBaseId([], 'foo')).to.throw(NotFoundError);
    });
  });
});
