import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { stub } from 'sinon';

import { CoreModule, EventBus, LineRender, NodeModule, onceEvent, RenderInputEvent } from '../../../src/lib';
import { INJECT_EVENT } from '../../../src/module';
import { EVENT_ACTOR_OUTPUT, EVENT_RENDER_INPUT, EVENT_STATE_STEP, META_QUIT } from '../../../src/util/constants';
import { getTestContainer } from '../../helper';
import { TestReadLine } from './helper';

describe('readline render', () => {
  it('should show output', async () => {
    const instance = TestReadLine.createStub();
    const readline = stub().returns(instance);

    const container = await getTestContainer(new CoreModule(), new NodeModule());
    const render = await container.create(LineRender, {
      config: {
        shortcuts: true,
      },
    }, readline);
    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_ACTOR_OUTPUT, {
      line: 'foo',
      step: {
        time: 0,
        turn: 0,
      },
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
      },
    }, readline);
    await render.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_STATE_STEP, {
      step: {
        time: 0,
        turn: 0,
      },
    });

    expect(instance.getPrompt()).to.include('turn 0');
  });

  xit('should show a newline between the prompt and output');
  xit('should not emit output after stopping');
});
