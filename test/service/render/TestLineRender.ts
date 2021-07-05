import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { spy, stub } from 'sinon';

import { CoreModule, EventBus, LineRender, NodeModule, onceEvent, RenderInputEvent } from '../../../src/lib';
import { INJECT_EVENT } from '../../../src/module';
import { EVENT_ACTOR_OUTPUT, EVENT_RENDER_INPUT, EVENT_STATE_STEP, META_QUIT } from '../../../src/util/constants';
import { zeroStep } from '../../../src/util/entity';
import { getTestContainer } from '../../helper';
import { TestReadLine } from './helper';

const THROTTLE_TIME = 10;

describe('readline render', () => {
  it('should show output', async () => {
    const instance = TestReadLine.createStub();
    const readline = stub().returns(instance);

    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(LineRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    }, readline);
    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_ACTOR_OUTPUT, {
      line: 'foo',
      step: zeroStep(),
    });

    expect(instance.write).to.have.been.calledWith('foo');
  });

  it('should emit a quit command when interrupted', async () => {
    const instance = new TestReadLine();
    const readline = stub().returns(instance);

    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(LineRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    }, readline);
    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<RenderInputEvent>(events, EVENT_RENDER_INPUT);

    instance.emit('SIGINT');

    return expect(pending).to.eventually.deep.equal({
      line: META_QUIT,
    });
  });

  it('should emit output for each line', async () => {
    const instance = new TestReadLine();
    const readline = stub().returns(instance);

    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(LineRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    }, readline);
    await render.start();

    const pendingLine = render.read();
    instance.emit('line', 'foo');

    return expect(pendingLine).to.eventually.equal('foo');
  });

  it('should show a prompt with the state step', async () => {
    const instance = new TestReadLine();
    const readline = stub().returns(instance);

    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(LineRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    }, readline);
    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_STATE_STEP, {
      step: zeroStep(),
    });

    expect(instance.getPrompt()).to.include('turn 0');
  });

  it('should not emit its own output', async () => {
    const instance = new TestReadLine();
    const writeSpy = spy(instance, 'write');

    const readline = stub().returns(instance);

    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(LineRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    }, readline);
    await render.start();

    render.show('foo');

    expect(writeSpy).to.have.been.calledWith('foo');
  });

  it('should close the line interface when stopping', async () => {
    const instance = TestReadLine.createStub();
    const readline = stub().returns(instance);

    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(LineRender, {
      config: {
        shortcuts: true,
        throttle: THROTTLE_TIME,
      },
    }, readline);
    await render.start();
    await render.stop();

    expect(instance.close).to.have.callCount(1);
  });

  xit('should show a newline between the prompt and output');
  xit('should not emit output after stopping');
});
