import { expect } from 'chai';
import { spy, stub } from 'sinon';

import { CoreModule } from '../../../../src/module/CoreModule';
import { BrowserPageLoader } from '../../../../src/service/loader/browser/PageLoader';
import { getTestContainer } from '../../../helper';

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
});
