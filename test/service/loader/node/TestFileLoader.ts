import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { stub } from 'sinon';

import { INJECT_EVENT } from '../../../../src/module/index.js';
import { CoreModule } from '../../../../src/module/CoreModule.js';
import { EventBus } from '../../../../src/service/event/index.js';
import { NodeFileLoader } from '../../../../src/service/loader/node/FileLoader.js';
import { onceEvent } from '../../../../src/util/async/event.js';
import { EVENT_LOADER_DONE, EVENT_LOADER_READ, EVENT_LOADER_SAVE } from '../../../../src/util/constants.js';
import { makeTestState } from '../../../entity.js';
import { getTestContainer } from '../../../helper.js';

describe('file loader', () => {
  it('should read from paths', async () => {
    const container = await getTestContainer(new CoreModule());

    const loader = await container.create(NodeFileLoader);
    return expect(loader.loadStr('README.md')).to.eventually.include('Textual Engine');
  });

  // TODO: use a mock filesystem
  it('should write to paths', async () => {
    const container = await getTestContainer(new CoreModule());

    const loader = await container.create(NodeFileLoader);
    const path = 'out/test.md';
    await loader.saveStr(path, 'foo');

    return expect(loader.loadStr(path)).to.eventually.include('foo');
  });

  // TODO: use a mock filesystem
  it('should round-trip binary data', async () => {
    const container = await getTestContainer(new CoreModule());

    const loader = await container.create(NodeFileLoader);
    const data = Buffer.from('foo\0');
    const path = 'out/test.bin';
    await loader.save(path, data);

    return expect(loader.load(path)).to.eventually.deep.equal(data);
  });

  it('should respond to save events for files', async () => {
    const container = await getTestContainer(new CoreModule());

    const fetch = stub();
    const loader = await container.create(NodeFileLoader, {}, fetch);
    await loader.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingDone = onceEvent(events, EVENT_LOADER_DONE);

    const doneStub = stub();
    events.on(EVENT_LOADER_DONE, doneStub);

    const state = makeTestState('', []);
    events.emit(EVENT_LOADER_SAVE, {
      data: {
        state,
        worlds: [],
      },
      path: 'file://out/test.yml',
    });

    await pendingDone;
  });

  it('should ignore reads whose protocol does not match', async () => {
    const container = await getTestContainer(new CoreModule());

    const fetch = stub();
    const loader = await container.create(NodeFileLoader, {}, fetch);
    await loader.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);

    const doneStub = stub();
    events.on(EVENT_LOADER_DONE, doneStub);

    events.emit(EVENT_LOADER_READ, {
      path: 'none://out/test.yml',
    });

    expect(doneStub).to.have.callCount(0);
  });

  it('should ignore saves whose protocol does not match', async () => {
    const container = await getTestContainer(new CoreModule());

    const fetch = stub();
    const loader = await container.create(NodeFileLoader, {}, fetch);
    await loader.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);

    const doneStub = stub();
    events.on(EVENT_LOADER_DONE, doneStub);

    const state = makeTestState('', []);
    events.emit(EVENT_LOADER_SAVE, {
      data: {
        state,
        worlds: [],
      },
      path: 'none://out/test.yml',
    });

    expect(doneStub).to.have.callCount(0);
  });
});
