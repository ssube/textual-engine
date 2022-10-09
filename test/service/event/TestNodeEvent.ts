import { expect } from 'chai';

import { CoreModule } from '../../../src/module/CoreModule.js';
import { Service } from '../../../src/service/index.js';
import { NodeEventBus } from '../../../src/service/event/NodeEventBus.js';
import { onceEvent } from '../../../src/util/async/event.js';
import { getTestContainer, stub } from '../../helper.js';

describe('node event bus', () => {
  /**
   * this is close to testing the underlying library/Node functionality, but both `emit` and `on` are
   * overridden and do other things before calling `super.*`, which does need to be tested.
   */
  it('should emit events to registered listeners', async () => {
    const container = await getTestContainer(new CoreModule());
    const events = await container.create(NodeEventBus);

    const pending = onceEvent(events, 'foo');
    const payload = {};
    events.emit('foo', payload);

    const result = await pending;
    expect(result).to.equal(payload);
  });

  it('should remove listeners by group', async () => {
    const container = await getTestContainer(new CoreModule());
    const events = await container.create(NodeEventBus);

    const group = {} as Service;

    events.on('foo', stub(), group);
    events.on('bar', stub(), group);

    expect(events.listenerCount('foo')).to.equal(1);
    expect(events.listenerCount('bar')).to.equal(1);

    events.removeGroup(group);

    expect(events.listenerCount('foo')).to.equal(0);
    expect(events.listenerCount('bar')).to.equal(0);
  });
});
