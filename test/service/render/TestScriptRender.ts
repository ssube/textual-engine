import { doesExist, mustExist } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { SinonFakeTimers } from 'sinon';

import { ConfigError } from '../../../src/error/ConfigError.js';
import { CoreModule } from '../../../src/module/CoreModule.js';
import { INJECT_EVENT } from '../../../src/module/index.js';
import { EventBus } from '../../../src/service/event/index.js';
import { ScriptRender } from '../../../src/service/render/ScriptRender.js';
import { EVENT_ACTOR_OUTPUT, EVENT_RENDER_INPUT, EVENT_STATE_STEP } from '../../../src/util/constants.js';
import { zeroStep } from '../../../src/util/entity/index.js';
import { getTestContainer, stub, useFakeTimers } from '../../helper.js';

describe('script render', () => {
  let clock: SinonFakeTimers;

  beforeEach(() => {
    clock = useFakeTimers();
  });

  afterEach(() => {
    if (doesExist(clock)) {
      clock.restore();
    }
  });

  it('should buffer output', async () => {
    const container = await getTestContainer(new CoreModule());
    const render = await container.create(ScriptRender, {
      config: {
        inputs: [],
      },
    });
    await render.start();

    const data = new Array(10).fill(0).map(() => Math.random().toString());
    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);

    for (const line of data) {
      events.emit(EVENT_ACTOR_OUTPUT, {
        line,
        step: zeroStep(),
      });
    }

    expect(render.getOutput()).to.have.lengthOf(data.length);
  });

  it('should emit input after some steps', async () => {
    const container = await getTestContainer(new CoreModule());
    const render = await container.create(ScriptRender, {
      config: {
        inputs: [{
          line: 'test',
          step: 5,
        }],
        loops: 1,
      },
    });
    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const inputStub = stub();
    events.on(EVENT_RENDER_INPUT, inputStub);

    for (let i = 0; i < 20; i += 1) {
      events.emit(EVENT_STATE_STEP, {
        step: zeroStep(),
      });

      await mustExist(clock).tickAsync(10);
    }

    expect(inputStub).to.have.callCount(1);
  });

  it('should emit input after some time', async () => {
    const container = await getTestContainer(new CoreModule());
    const render = await container.create(ScriptRender, {
      config: {
        inputs: [{
          line: 'test',
          time: 25,
        }],
        loops: 1,
      },
    });
    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const inputStub = stub();
    events.on(EVENT_RENDER_INPUT, inputStub);

    await mustExist(clock).tickAsync(500);

    expect(inputStub).to.have.callCount(1);
  });

  it('should repeat the input up to the loop limit', async () => {
    const container = await getTestContainer(new CoreModule());
    const render = await container.create(ScriptRender, {
      config: {
        inputs: [{
          line: 'test',
          step: 2,
        }, {
          line: 'other',
          step: 2,
        }],
        loops: 5,
      },
    });
    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const inputStub = stub();
    events.on(EVENT_RENDER_INPUT, inputStub);

    for (let i = 0; i < 25; i += 1) {
      events.emit(EVENT_STATE_STEP, {
        step: zeroStep(),
      });
      await mustExist(clock).tickAsync(10);
    }

    expect(inputStub).to.have.callCount(10);
  });

  it('should validate the config', async () => {
    const container = await getTestContainer(new CoreModule());
    return expect(container.create(ScriptRender, {
      config: {
        inputs: 'no',
        loops: 5,
      },
    })).to.eventually.be.rejectedWith(ConfigError);
  });

  it('should wait for the time trigger before counting against the step trigger');
});
