import { expect } from 'chai';

import { onceWithRemove } from '../../../src/util/async/event.js';
import { WatchableMap } from '../../../src/util/async/WatchableMap.js';

describe('watchable map', () => {
  it('should emit the key being set', async () => {
    const events = new WatchableMap();
    const { pending } = onceWithRemove(events, 'foo');
    events.set('foo', 'bar');
    return expect(pending).to.eventually.equal('bar');
  });
});
