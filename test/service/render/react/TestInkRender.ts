import { doesExist, Maybe, mustExist } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { SinonFakeTimers } from 'sinon';

import { CoreModule } from '../../../../src/module/CoreModule.js';
import { INJECT_EVENT } from '../../../../src/module/index.js';
import { NodeModule } from '../../../../src/module/NodeModule.js';
import { EventBus } from '../../../../src/service/event/index.js';
import { InkRender } from '../../../../src/service/render/react/InkRender.js';
import { EVENT_ACTOR_OUTPUT, EVENT_ACTOR_QUIT, EVENT_ACTOR_ROOM, EVENT_STATE_STEP } from '../../../../src/util/constants.js';
import { zeroStep } from '../../../../src/util/entity/index.js';
import { makeTestActor, makeTestRoom } from '../../../entity.js';
import { getTestContainer, stub, useFakeTimers } from '../../../helper.js';

const THROTTLE_TIME = 10;
const THROTTLE_WAIT = THROTTLE_TIME * 2;

describe('react ink render', () => {
  let clock: Maybe<SinonFakeTimers>;

  before(() => {
    clock = useFakeTimers();
  });

  after(() => {
    if (doesExist(clock)) {
      clock.restore();
    }
  });

  it('should update the screen on actor output', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    });
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_ACTOR_OUTPUT, {
      line: '',
      step: zeroStep(),
    });

    await mustExist(clock).tickAsync(THROTTLE_WAIT);
    expect(update).to.have.callCount(2); // once at start, once on output
  });


  it('should update the screen on room changes', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    });
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_ACTOR_ROOM, {
      actor: makeTestActor('', '', ''),
      pid: '',
      room: makeTestRoom('', '', '', [], []),
    });

    await mustExist(clock).tickAsync(THROTTLE_WAIT);
    expect(update).to.have.callCount(2); // once at start, once on room
  });

  it('should update the screen on state steps', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    });
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_STATE_STEP, {
      step: zeroStep(),
    });

    expect(update).to.have.callCount(2); // once at start, once on step
  });

  it('should update the screen on quit events', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    });
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_ACTOR_QUIT, {
      line: 'test.quit',
      stats: [],
    });

    expect(update).to.have.callCount(2); // once at start, once at stop
  });

  it('should not update the screen after being stopped', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(InkRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    });
    const update = stub(render, 'update');

    await render.start();
    await render.stop();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_ACTOR_QUIT, {
      line: 'test.quit',
      stats: [],
    });

    expect(update).to.have.callCount(1);
  });

  xit('should read the next submitted line');
});
