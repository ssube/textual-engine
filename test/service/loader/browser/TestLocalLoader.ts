import { expect } from 'chai';
import { stub } from 'sinon';

import { CoreModule } from '../../../../src/module/CoreModule';
import { BrowserLocalLoader } from '../../../../src/service/loader/browser/LocalLoader';
import { getTestContainer } from '../../../helper';

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
});
