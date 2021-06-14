import { expect } from 'chai';

import { WatchableMap } from '../../../src/lib';
import { onceWithRemove } from '../../../src/util/async/event';

describe('watchable map', () => {
  it('should emit the key being set', async () => {
    const events = new WatchableMap();
    const { pending } = onceWithRemove(events, 'foo');
    events.set('foo', 'bar');
    return expect(pending).to.eventually.equal('bar');
  });
});
