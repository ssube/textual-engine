import { expect } from 'chai';
import { Container } from 'noicejs';
import { spy, stub } from 'sinon';

import { BrowserPageLoader } from '../../../src/service/loader/browser/PageLoader';

describe('page loader', () => {
  it('should load strings from element contents', async () => {
    const container = Container.from();
    await container.configure();

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
    const container = Container.from();
    await container.configure();

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

  it('should dump debug data to console', async () => {
    const container = Container.from();
    await container.configure();

    const dom = {
      getElementById: stub().returns(undefined),
    };

    const consoleSpy = spy(console, 'log');

    const loader = await container.create(BrowserPageLoader, {}, dom);
    await loader.dump('README.md', Buffer.from('foo'));

    // assert what?
    consoleSpy.restore();
    expect(consoleSpy).to.have.callCount(1);
  });

  xit('should save strings to local storage');
  xit('should load strings from local storage');
  xit('should prefer local storage over page elements');
});
