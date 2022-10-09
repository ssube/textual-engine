import { NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { CoreModule } from '../../../../src/module/CoreModule.js';
import { BrowserFetchLoader } from '../../../../src/service/loader/browser/FetchLoader.js';
import { getTestContainer, stub } from '../../../helper.js';

describe('browser fetch loader', () => {
  it('should read from URLs', async () => {
    const container = await getTestContainer(new CoreModule());

    const payload = 'foo';
    const window = {
      fetch: stub().returns({
        text: () => Promise.resolve(payload),
      }),
    };
    const loader = await container.create(BrowserFetchLoader, {}, window);

    await expect(loader.loadStr('README.md')).to.eventually.equal(payload);
    await expect(loader.load('README.md')).to.eventually.deep.equal(Buffer.from(payload));
  });

  it('should not implement save', async () => {
    const container = await getTestContainer(new CoreModule());

    const fetch = stub();
    const loader = await container.create(BrowserFetchLoader, {}, fetch);
    const path = 'out/test.md';

    await expect(loader.save(path, Buffer.from('foo'))).to.eventually.be.rejectedWith(NotImplementedError);
    await expect(loader.saveStr(path, 'foo')).to.eventually.be.rejectedWith(NotImplementedError);
  });
});
