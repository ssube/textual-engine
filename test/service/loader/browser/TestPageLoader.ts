import { NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { CoreModule } from '../../../../src/module/CoreModule.js';
import { BrowserPageLoader } from '../../../../src/service/loader/browser/PageLoader.js';
import { getTestContainer, spy, stub } from '../../../helper.js';

describe('page loader', () => {
  it('should load strings from element contents', async () => {
    const container = await getTestContainer(new CoreModule());

    const elem = {
      get textContent() {
        return 'foo';
      },
    };
    const contentSpy = spy(elem, 'textContent', ['get']);

    const dom = {
      getElementById: stub().returns(elem),
    };

    const loader = await container.create(BrowserPageLoader, {}, dom);

    await expect(loader.loadStr('README.md')).to.eventually.include('foo');
    expect(dom.getElementById, 'element spy').to.have.callCount(1).and.been.calledWith('README.md');
    expect(contentSpy.get, 'content spy').to.have.callCount(1);
  });

  it('should load buffers from elements', async () => {
    const container = await getTestContainer(new CoreModule());

    const content = 'foo';
    const elem = {
      get textContent() {
        return 'foo';
      },
    };
    const contentSpy = spy(elem, 'textContent', ['get']);

    const dom = {
      getElementById: stub().returns(elem),
    };

    const loader = await container.create(BrowserPageLoader, {}, dom);
    const buffer = await loader.load('README.md');

    expect(buffer.length).to.equal(content.length);
    expect(contentSpy.get, 'content spy').to.have.callCount(1);
  });

  it('should not implement save', async () => {
    const container = await getTestContainer(new CoreModule());

    const dom = {
      getElementById: stub().returns({}),
    };

    const loader = await container.create(BrowserPageLoader, {}, dom);
    const path = 'out/test.md';

    await expect(loader.save(path, Buffer.from('foo'))).to.eventually.be.rejectedWith(NotImplementedError);
    await expect(loader.saveStr(path, 'foo')).to.eventually.be.rejectedWith(NotImplementedError);
  });
});
