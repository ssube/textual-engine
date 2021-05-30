import { expect } from 'chai';

import { matchIdSegments } from '../../src/util/string';

describe('string utils', () => {
  describe('match ID helper', () => {
    it('should match if the value starts with the filter segments', async () => {
      expect(matchIdSegments('foo-1', 'foo-1')).to.equal(true);
      expect(matchIdSegments('foo-1', 'foo')).to.equal(true);
      expect(matchIdSegments('foo-', 'foo')).to.equal(true);
      expect(matchIdSegments('foo', 'foo')).to.equal(true);
    });

    it('should not match if the value starts with a partial segment', async () => {
      // this was the first real bug :D
      expect(matchIdSegments('foo-11', 'foo-1')).to.equal(false);
    });
  });
});
