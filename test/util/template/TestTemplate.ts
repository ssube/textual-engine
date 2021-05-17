import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { findByTemplateId } from '../../../src/util/template';

describe('template helpers', () => {
  describe('find template by id', () => {
    it('should throw when no item is found', async () => {
      expect(() => findByTemplateId([], 'foo')).to.throw(NotFoundError);
    });
  });
});
