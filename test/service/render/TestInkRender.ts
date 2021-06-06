import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { stub } from 'sinon';

import { INJECT_EVENT } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { NodeModule } from '../../../src/module/NodeModule';
import { EventBus } from '../../../src/service/event';
import { InkRender } from '../../../src/service/render/react/InkRender';
import { EVENT_ACTOR_OUTPUT, EVENT_COMMON_QUIT, EVENT_STATE_ROOM, EVENT_STATE_STEP } from '../../../src/util/constants';
import { makeTestActor, makeTestRoom } from '../../entity';
import { getTestContainer } from '../../helper';

describe('react ink render', () => {
  it('should update the screen on actor output', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender);
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_ACTOR_OUTPUT, {
      line: '',
      step: {
        time: 0,
        turn: 0,
      },
    });

    expect(update).to.have.callCount(2); // once at start, once on output
  });


  it('should update the screen on room changes', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender);
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_STATE_ROOM, {
      actor: makeTestActor('', '', ''),
      room: makeTestRoom('', '', '', [], []),
    });

    expect(update).to.have.callCount(2); // once at start, once on room
  });

  it('should update the screen on state steps', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender);
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_STATE_STEP, {
      step: {
        time: 0,
        turn: 0,
      },
    });

    expect(update).to.have.callCount(2); // once at start, once on step
  });

  it('should update the screen on quit events', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender);
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_COMMON_QUIT);

    expect(update).to.have.callCount(2); // once at start, once at stop
  });

  it('should not update the screen after being stopped', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender);
    const update = stub(render, 'update');

    await render.start();
    await render.stop();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_COMMON_QUIT);

    expect(update).to.have.callCount(1);
  });

  xit('should read the next submitted line');
});
