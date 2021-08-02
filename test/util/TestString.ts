import { expect } from 'chai';

import { hasText, matchIdSegments, splitWords, trim } from '../../src/util/string.js';

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

    it('should not match if the filter is longer than the ID', async () => {
      expect(matchIdSegments('foo-1', 'foo-1-1')).to.equal(false);
      expect(matchIdSegments('foo-bar', 'foo-1-1')).to.equal(false);
    });
  });

  describe('has text helper', () => {
    it('should check existence', async () => {
      expect(hasText(null as any)).to.equal(false);
      expect(hasText(undefined as any)).to.equal(false);
      expect(hasText([] as any)).to.equal(false);
    });

    it('should check whitespace', async () => {
      expect(hasText('\n')).to.equal(false);
      expect(hasText('\t')).to.equal(false);
      expect(hasText('   ')).to.equal(false);
    });
  });

  describe('split words helper', () => {
    it('should split on whitespace', async () => {
      expect(splitWords('foo bar bin')).to.deep.equal(['foo', 'bar', 'bin']);
    });

    it('should respect quotes', async () => {
      expect(splitWords('foo "bar bin"')).to.deep.equal(['foo', 'bar bin']);
    });

    it('should handle empty strings', async () => {
      expect(splitWords('')).to.deep.equal(['']); // TODO: should this return an empty array instead?
    });
  });

  describe('trim helper', () => {
    it('should remove whitespace from both ends', async () => {
      expect(trim('  foo\t')).to.equal('foo');
    });
  });
});
