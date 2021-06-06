import { expect } from 'chai';

import { CompletionSet } from '../../../src/util/async/CompletionSet';

describe('completion set', () => {
  it('should complete when empty', async () => {
    const set = new CompletionSet([1, 2, 3]);
    expect(set.complete(1)).to.equal(false);
    expect(set.complete(3)).to.equal(false); // out of order, just in case
    expect(set.complete(2)).to.equal(true); // last item
  });

  it('should copy contents', async () => {
    const set = new CompletionSet([1, 2, 3]);
    const left = set.remaining();
    left.push(4);
    expect(set.size).to.be.lessThan(left.length);
  });
});
