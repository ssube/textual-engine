import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import sinon from 'sinon';

import { CoreModule } from '../../../../src/module/CoreModule.js';
import { INJECT_EVENT } from '../../../../src/module/index.js';
import { EventBus } from '../../../../src/service/event/index.js';
import { BrowserLocalLoader } from '../../../../src/service/loader/browser/LocalLoader.js';
import { EVENT_LOADER_SAVE } from '../../../../src/util/constants.js';
import { getTestContainer } from '../../../helper.js';

const { stub } = sinon;
describe('browser local loader', () => {
  it('should read from storage', async () => {
    const container = await getTestContainer(new CoreModule());

    const payload = 'foo';
    const window = {
      localStorage: {
        getItem: stub().returns(payload),
        setItem: stub(),
      },
    };
    const loader = await container.create(BrowserLocalLoader, {}, window);

    await expect(loader.loadStr('README.md')).to.eventually.equal(payload);
    await expect(loader.load('README.md')).to.eventually.deep.equal(Buffer.from(payload));
  });

  it('should write to storage', async () => {
    const container = await getTestContainer(new CoreModule());

    const window = {
      localStorage: {
        getItem: stub(),
        setItem: stub(),
      },
    };
    const loader = await container.create(BrowserLocalLoader, {}, window);
    const path = 'out/test.md';
    const payload = 'foo';

    await loader.save(path, Buffer.from(payload));
    await loader.saveStr(path, payload);

    expect(window.localStorage.setItem).to.have.callCount(2).and.been.calledWith(path, payload);
  });

  it('should write strings to storage', async () => {
    const container = await getTestContainer(new CoreModule());

    const window = {
      localStorage: {
        getItem: stub(),
        setItem: stub(),
      },
    };
    const loader = await container.create(BrowserLocalLoader, {}, window);
    await loader.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);

    const path = 'out/test.md';
    const data = 'foo';
    events.emit(EVENT_LOADER_SAVE, {
      path: `local://${path}`,
      data,
    });

    expect(window.localStorage.setItem).to.have.callCount(1).and.been.calledWith(path, data);
  });
});
