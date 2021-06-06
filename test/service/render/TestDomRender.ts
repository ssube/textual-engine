import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { stub } from 'sinon';

import { INJECT_EVENT } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { NodeModule } from '../../../src/module/NodeModule';
import { EventBus } from '../../../src/service/event';
import { RenderOutputEvent } from '../../../src/service/render/events';
import { ReactDomRender } from '../../../src/service/render/react/DomRender';
import { onceEvent } from '../../../src/util/async/event';
import {
  EVENT_ACTOR_OUTPUT,
  EVENT_ACTOR_ROOM,
  EVENT_COMMON_QUIT,
  EVENT_RENDER_OUTPUT,
  EVENT_STATE_STEP,
} from '../../../src/util/constants';
import { makeTestRoom } from '../../entity';
import { getTestContainer } from '../../helper';

describe('react dom render', () => {
  it('should update the screen on actor output', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(ReactDomRender, {
      config: {
        shortcuts: true,
      },
    });
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
    const render = await container.create(ReactDomRender, {
      config: {
        shortcuts: true,
      },
    });
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_ACTOR_ROOM, {
      room: makeTestRoom('', '', '', [], []),
    });

    expect(update).to.have.callCount(2); // once at start, once on room
  });

  it('should update the screen on state steps', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(ReactDomRender, {
      config: {
        shortcuts: true,
      },
    });
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
    const render = await container.create(ReactDomRender, {
      config: {
        shortcuts: true,
      },
    });
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_COMMON_QUIT);

    expect(update).to.have.callCount(2); // once at start, once at stop
  });

  it('should not update the screen after being stopped', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(ReactDomRender, {
      config: {
        shortcuts: true,
      },
    });
    const update = stub(render, 'update');

    await render.start();
    await render.stop();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_COMMON_QUIT);

    expect(update).to.have.callCount(1);
  });

  it('should buffer output to be shown later', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(ReactDomRender, {
      config: {
        shortcuts: true,
      },
    });
    const update = stub(render, 'update');

    await render.start();
    expect(update).to.have.callCount(1);
    await render.show('foo');
    expect(update).to.have.callCount(1);
  });

  it('should read the next submitted line', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(ReactDomRender, {
      config: {
        shortcuts: true,
      },
    });
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingOutput = onceEvent<RenderOutputEvent>(events, EVENT_RENDER_OUTPUT);
    const pendingRead = render.read();

    const line = 'foo';
    render.nextLine(line);

    await expect(pendingOutput).to.eventually.deep.equal({
      line,
    });
    await expect(pendingRead).to.eventually.equal(line);
  });

  it('should not emit empty lines', async () => {
    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(ReactDomRender, {
      config: {
        shortcuts: true,
      },
    });
    const update = stub(render, 'update');

    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const onStub = stub(events, 'on');

    render.nextLine('');

    expect(onStub).to.have.callCount(0);
  });
});